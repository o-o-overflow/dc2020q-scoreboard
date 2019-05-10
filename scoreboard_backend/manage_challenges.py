#!/usr/bin/env python3
import argparse
import json
import os
import subprocess
import sys


def parse_json(json_file):
    try:
        return json.load(json_file)
    except json.decoder.JSONDecodeError:
        print(f"Invalid scoreboard json file: {json_file.name}")
        return 1


class CommandHandler:
    def add(self, arguments):
        challenges = parse_json(arguments.json)
        return self._run_command("challenges_add", "--path", arguments.json.name)

    def open(self, arguments):
        data = {"id": arguments.challenge}
        return self._run_command("challenge_open", "-d", json.dumps(data))

    def openall(self, arguments):
        if arguments.environment != "dev":
            print("Can only run openall in the dev environment.")
            return 1
        for challenge in parse_json(arguments.json):
            data = {"id": challenge["id"]}
            self._run_command("challenge_open", "-d", json.dumps(data))
        return 0

    def set(self, arguments):
        challenges = parse_json(arguments.json)
        return self._run_command("challenges_set", "--path", arguments.json.name)

    def update(self, argument):
        challenges = parse_json(arguments.json)
        print(f"update {argument.challenge}")
        # return self._run_command()

    def _run_command(self, *sls_arguments):
        process = subprocess.run(
            ["sls", "invoke", "-lf"] + list(sls_arguments),
            cwd=os.path.dirname(__file__),
        )
        return process.returncode


def main():
    json_default = os.path.abspath(
        os.path.join(
            os.path.dirname(__file__),
            "..",
            "..",
            "dc2019q-chalmanager",
            "scoreboard.json",
        )
    )

    argument_parser = argparse.ArgumentParser()
    argument_parser.add_argument(
        "-e",
        "--environment",
        choices=["dev", "prod"],
        default="dev",
        help="The environment to run in (default: dev)",
    )
    subparsers = argument_parser.add_subparsers(title="command", dest="command")
    add_parser = subparsers.add_parser(
        "add",
        help="Add new challenges to the scoreboard. Ignores existing challenges. Note: All categories must already exist in the DB.",
    )
    add_parser.add_argument(
        "-j",
        "--json",
        default=json_default,
        help=f"The path to the scoreboard json file (default: {json_default})",
        type=argparse.FileType(),
    )

    open_parser = subparsers.add_parser("open", help="Open a challenge.")
    open_parser.add_argument("challenge", help="The ID of the challenge to open.")

    openall_parser = subparsers.add_parser(
        "openall", help="Open all challenges (only works in the dev environment)."
    )
    openall_parser.add_argument(
        "-j",
        "--json",
        default=json_default,
        help=f"The path to the scoreboard json file (default: {json_default})",
        type=argparse.FileType(),
    )

    set_parser = subparsers.add_parser(
        "set", help="Wipe existing data and set challenges."
    )
    set_parser.add_argument(
        "-j",
        "--json",
        default=json_default,
        help=f"The path to the scoreboard json file (default: {json_default})",
        type=argparse.FileType(),
    )

    update_parser = subparsers.add_parser(
        "update", help="Update the description, flag, and title for a single challenge."
    )
    update_parser.add_argument(
        "-j",
        "--json",
        default=json_default,
        help=f"The path to the scoreboard json file (default: {json_default})",
        type=argparse.FileType(),
    )
    update_parser.add_argument("challenge", help="The ID of the challenge to update.")

    arguments = argument_parser.parse_args()
    if arguments.command is None:
        argument_parser.error("command is required")

    command_handler = CommandHandler()
    return getattr(command_handler, arguments.command)(arguments)


if __name__ == "__main__":
    sys.exit(main())
