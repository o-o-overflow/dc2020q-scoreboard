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
        sys.exit(1)


class CommandHandler:
    def __init__(self, environment):
        self.environment = environment

    def add(self, arguments):
        parse_json(arguments.json)
        return self._run_command("challenges_add", "--path", arguments.json.name)

    def delete(self, arguments):
        data = {"id": arguments.challenge}
        return self._run_command("challenge_delete", "-d", json.dumps(data))

    def open(self, arguments):
        data = {"id": arguments.challenge}
        return self._run_command("challenge_open", "-d", json.dumps(data))

    def openall(self, arguments):
        if self.environment != "development":
            print("Can only run openall in the development environment.")
            return 1
        for challenge in parse_json(arguments.json):
            data = {"id": challenge["id"]}
            self._run_command("challenge_open", "-d", json.dumps(data))
        return 0

    def set(self, arguments):
        parse_json(arguments.json)
        return self._run_command("challenges_set", "--path", arguments.json.name)

    def update(self, arguments):
        challenges = parse_json(arguments.json)
        try:
            challenge = next(x for x in challenges if x["id"] == arguments.challenge)
        except StopIteration:
            print(f"Invalid challenge: {arguments.challenge}")
            return 1
        data = {
            "id": challenge["id"],
            "description": challenge["description"],
            "flag_hash": challenge["flag_hash"],
        }
        return self._run_command("challenge_update", "-d", json.dumps(data))

    def _run_command(self, *sls_arguments):
        process = subprocess.run(
            ["sls", "invoke", "--stage", self.environment, "-lf", *sls_arguments],
            cwd=os.path.dirname(__file__),
        )
        return process.returncode


def main():
    json_default = os.path.abspath(
        os.path.join(
            os.path.dirname(__file__),
            "..",
            "..",
            "dc2020q-chalmanager",
            "scoreboard.json",
        )
    )

    argument_parser = argparse.ArgumentParser()
    argument_parser.add_argument(
        "-e",
        "--environment",
        choices=["development", "production"],
        default="development",
        help="The environment to run in (default: development)",
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

    delete_parser = subparsers.add_parser(
        "delete", help="Delete an unopened challenge."
    )
    delete_parser.add_argument(
        "challenge", help="The ID of the unopened challenge to delete."
    )

    open_parser = subparsers.add_parser("open", help="Open a challenge.")
    open_parser.add_argument("challenge", help="The ID of the challenge to open.")

    openall_parser = subparsers.add_parser(
        "openall",
        help="Open all challenges (only works in the development environment).",
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
        "update", help="Update the description and flag for a single challenge."
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

    command_handler = CommandHandler(arguments.environment)
    return getattr(command_handler, arguments.command)(arguments)


if __name__ == "__main__":
    sys.exit(main())
