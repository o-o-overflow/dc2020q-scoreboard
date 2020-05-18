#!/usr/bin/env python3
import json
import sys
from datetime import datetime

import boto3


def date_format(item):
    if isinstance(item, datetime):
        return item.isoformat()
    return str(item)


PERIOD = 300
START_TIME = {60: datetime(2020, 5, 1), 300: datetime(2020, 1, 1)}


def main():
    session = boto3.session.Session(profile_name="ooo")
    lambda_client = session.client("lambda")
    cloudwatch = session.client("cloudwatch")

    metrics = []
    paginator = cloudwatch.get_paginator("list_metrics")
    for response in paginator.paginate(Namespace="AWS/NATGateway"):
        for metric in response["Metrics"]:
            if metric["Namespace"] in {"AWS/ApiGateway", "AWS/Lambda", "AWS/RDS"}:
                continue

            label = f"nat_gateway_{metric['Dimensions'][0]['Value']}_{metric['MetricName'].lower()}"
            metrics.append(
                {
                    "Id": label.replace("-", "_"),
                    "Label": label,
                    "MetricStat": {
                        "Metric": metric,
                        "Period": PERIOD,
                        "Stat": "Average",
                    },
                }
            )

    while metrics:
        current_metrics = metrics[:4]
        metrics = metrics[4:]

        response = cloudwatch.get_metric_data(
            EndTime=datetime(2020, 5, 18),
            MaxDatapoints=100800,
            MetricDataQueries=current_metrics,
            StartTime=START_TIME[PERIOD],
        )

        assert response["Messages"] == []
        assert response["ResponseMetadata"]["HTTPStatusCode"] == 200

        for data in response["MetricDataResults"]:
            if data["StatusCode"] == "Complete":
                print(data["StatusCode"])
                assert False

            info = sorted(zip(data["Timestamps"], data["Values"]))
            print(f"{len(info):4d} {min(x[0] for x in info)} {data['Label']}")
            with open(f"{data['Label']}_{PERIOD}.json", "w") as fp:
                json.dump(info, fp, default=date_format, indent=2)

        assert response.get("NextToken") is None


if __name__ == "__main__":
    sys.exit(main())
