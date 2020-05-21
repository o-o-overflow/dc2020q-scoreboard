#!/usr/bin/env python3
import boto3
import sys
import time


IGNORE_FUNCTIONS = {"scoreboard-production-challenges"}
LOG_BUCKET = "ooo-cloudwatch-us-east-2"


def create_export(client, log_group):
    now = int(time.time())
    return client.create_export_task(
        destination=LOG_BUCKET,
        destinationPrefix=log_group,
        fromTime=(now - 864000 * 100) * 1000,
        logGroupName=log_group,
        to=(now + 100) * 1000,
    )["taskId"]


def is_export_completed(client, task_id):
    tasks = client.describe_export_tasks(taskId=task_id)["exportTasks"]
    assert len(tasks) == 1
    return tasks[0]["status"]["code"] == "COMPLETED"


def lambda_functions(client):
    for function in client.list_functions()["Functions"]:
        function_name = function["FunctionName"]
        if (
            function_name.startswith("scoreboard-production")
            and function_name not in IGNORE_FUNCTIONS
        ):
            yield function_name


def main():
    session = boto3.session.Session(profile_name="ooo")
    lambda_client = session.client("lambda")
    log_client = session.client("logs")

    #run_export(log_client, "/ecs/uploaadit")

    for function in lambda_functions(lambda_client):
        print(f"\n{function}")
        log_group = f"/aws/lambda/{function}"
        run_export(log_client, log_group)


def run_export(log_client, log_group):
    task_id = create_export(log_client, log_group)
    while not is_export_completed(log_client, task_id):
        sys.stdout.write(".")
        sys.stdout.flush()
        time.sleep(1)


if __name__ == "__main__":
    sys.exit(main())
