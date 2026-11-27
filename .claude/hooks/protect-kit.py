#!/usr/bin/env python3
"""Block changes to kit files in a factory project and in every worktree of its repository.

A path is a kit file when it is AGENTS.md, CLAUDE.md, .claude/settings.json, or under agent/,
.claude/hooks/ or .kit/,
relative to the root of the git checkout that holds it, and that checkout belongs to this
project's repository. Exit 2 blocks the tool call; stderr is shown to the agent.
"""
import json, os, re, shlex, subprocess, sys

PROTECTED_DIRS = ("agent/", ".claude/hooks/", ".kit/")
PROTECTED_FILES = ("AGENTS.md", "CLAUDE.md", ".claude/settings.json")
MSG = ("Blocked: {what} is a kit file. Kit files are read-only in this project. "
       "Write the problem in project/kit-feedback.md instead, then continue your task.")
MSG_FACTORY = ("Blocked: {what} is outside this project, in the factory workspace. A project session "
               "can read the factory, but it cannot change it. Put fixtures and copies inside this project, "
               "or write the need in project/kit-feedback.md.")

root = os.path.realpath(os.environ.get("CLAUDE_PROJECT_DIR", os.getcwd()))
_cache = {}


def git(dir_, *args):
    r = subprocess.run(["git", "-C", dir_, *args], capture_output=True, text=True)
    return r.stdout.strip() if r.returncode == 0 else None


def common_dir(dir_):
    if dir_ not in _cache:
        out = git(dir_, "rev-parse", "--show-toplevel", "--git-common-dir")
        if out:
            top, common = out.splitlines()[:2]
            _cache[dir_] = (os.path.realpath(top), os.path.realpath(os.path.join(dir_, common)))
        else:
            _cache[dir_] = (None, None)
    return _cache[dir_]


PROJECT_COMMON = common_dir(root)[1]


def find_workspace():
    """The workspace that holds the factory: projects/<name> -> app-factory (has FACTORY.md) -> workspace."""
    projects = os.path.dirname(root)
    factory = os.path.dirname(projects)
    if os.path.basename(projects) == "projects" and os.path.isfile(os.path.join(factory, "FACTORY.md")):
        return os.path.dirname(factory)
    return None


WORKSPACE = find_workspace()


def checkout_root(path):
    d = path if os.path.isdir(path) else os.path.dirname(path)
    while d and not os.path.isdir(d):
        d = os.path.dirname(d)
    top, common = common_dir(d or "/")
    if top and PROJECT_COMMON and common == PROJECT_COMMON:
        return top
    if path == root or path.startswith(root + os.sep):
        return root
    return None


def protected(token, base):
    token = token.strip("'\"")
    if not token or token.startswith("-"):
        return False
    p = os.path.realpath(os.path.join(base, os.path.expanduser(token)))
    top = checkout_root(p)
    if not top:
        if WORKSPACE and (p == WORKSPACE or p.startswith(WORKSPACE + os.sep)):
            return "factory"
        return False
    rel = os.path.relpath(p, top).replace(os.sep, "/")
    return rel in PROTECTED_FILES or any(rel == d.rstrip("/") or rel.startswith(d) for d in PROTECTED_DIRS)


def block(what, kind=True):
    print((MSG_FACTORY if kind == "factory" else MSG).format(what=what), file=sys.stderr)
    sys.exit(2)


def strip_heredocs(cmd):
    """Remove heredoc bodies: their text is data, not shell syntax."""
    lines, out, end = cmd.split("\n"), [], None
    for line in lines:
        if end is not None:
            if line.strip() == end:
                end = None
            continue
        out.append(line)
        m = re.search(r"<<-?\s*['\"]?([A-Za-z_][A-Za-z0-9_]*)['\"]?", line)
        if m:
            end = m.group(1)
    return "\n".join(out)


WRITE_CMDS = {"mv", "rm", "rmdir", "chmod", "chown", "truncate", "touch", "dd", "unlink", "shred", "mkdir"}
SCRIPT_OPTS = {"sed": {"-e", "--expression", "-f", "--file"}, "perl": {"-e", "-E"}}


def file_args(name, words):
    """Operands that are files: drop options, the values of script options, and sed's inline script."""
    out, skip, has_script_opt = [], False, False
    for w in words[1:]:
        if skip:
            skip = False
            continue
        if w in SCRIPT_OPTS.get(name, ()):
            skip, has_script_opt = True, True
            continue
        if w.startswith("-") or re.match(r"^\d?>", w):
            continue
        out.append(w)
    if name == "sed" and not has_script_opt and out:
        out = out[1:]
    return out
DEST_CMDS = {"cp", "install", "rsync", "ln"}


def check_bash(cmd, cwd):
    cmd = strip_heredocs(cmd)
    for seg in re.split(r"&&|\|\||;|\||\n", cmd):
        for m in re.finditer(r"(?:\d?>>?|&>)\s*([^\s;&|<>]+)", seg):
            k = protected(m.group(1), cwd)
            if k:
                block(m.group(1), k)
        try:
            words = shlex.split(seg)
        except ValueError:
            words = seg.split()
        while words and re.match(r"^\w+=", words[0]):
            words = words[1:]
        if words and words[0] in ("sudo", "env", "command", "nohup", "time"):
            words = words[1:]
        if not words:
            continue
        name = os.path.basename(words[0])
        args = [w for w in words[1:] if not w.startswith("-") and not re.match(r"^\d?>", w)]
        if name == "cd":
            target = args[0] if args else os.path.expanduser("~")
            cwd = os.path.realpath(os.path.join(cwd, os.path.expanduser(target)))
            continue
        hit = lambda xs: next((a for a in xs if protected(a, cwd)), None)
        kind = lambda a: protected(a, cwd)
        if name == "tee" and hit(args):
            block(hit(args), kind(hit(args)))
        if name in ("sed", "perl") and any(w.startswith("-i") or w == "-pi" for w in words[1:]):
            files = file_args(name, words)
            if hit(files):
                block(hit(files), kind(hit(files)))
        if name in DEST_CMDS and args and protected(args[-1], cwd):
            block(args[-1], kind(args[-1]))
        if name in WRITE_CMDS and hit(args):
            block(hit(args), kind(hit(args)))
        if name == "git" and len(words) > 2 and words[1] == "worktree" and words[2] == "add":
            rest, skip = [], False
            for w in words[3:]:
                if skip:
                    skip = False
                    continue
                if w in ("-b", "-B", "--reason"):
                    skip = True
                    continue
                if not w.startswith("-"):
                    rest.append(w)
            if rest and protected(rest[0], cwd):
                block(rest[0], kind(rest[0]))
        if name == "git" and len(words) > 1 and words[1] == "clone" and len(args) >= 3 and protected(args[-1], cwd):
            block(args[-1], kind(args[-1]))
        if name == "git" and len(words) > 1 and words[1] in ("checkout", "restore", "rm", "mv", "apply", "stash") and hit(args[1:]):
            block(hit(args[1:]), kind(hit(args[1:])))


def main():
    try:
        data = json.load(sys.stdin)
    except Exception:
        return
    tool = data.get("tool_name", "")
    ti = data.get("tool_input", {}) or {}
    cwd = os.path.realpath(data.get("cwd") or root)
    if tool in ("Edit", "Write", "MultiEdit", "NotebookEdit"):
        path = ti.get("file_path") or ti.get("notebook_path") or ""
        k = protected(path, cwd) if path else False
        if k:
            block(path, k)
    elif tool == "Bash":
        check_bash(ti.get("command", ""), cwd)


main()
