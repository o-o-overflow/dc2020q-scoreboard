#!/usr/bin/env python3
import json
import sys
from collections import defaultdict
from datetime import datetime

import boto3


def date_format(item):
    if isinstance(item, datetime):
        return item.isoformat()
    return str(item)


PERIOD = 60
START_TIME = {60: datetime(2020, 5, 1), 300: datetime(2020, 1, 1)}


def build_metric_id(metric):
    parts = [metric["Namespace"].replace("/", "_"), metric["MetricName"]]
    for dimension in metric["Dimensions"]:
        parts.append(
            dimension["Value"].replace("-", "_").replace(".", "_").replace(":", "_")
        )
    return "_".join(parts).lower()


def main():
    session = boto3.session.Session(profile_name="ooo")
    lambda_client = session.client("lambda")
    cloudwatch = session.client("cloudwatch")

    metrics = []
    paginator = cloudwatch.get_paginator("list_metrics")
    for response in paginator.paginate():
        for metric in response["Metrics"]:
            if metric["Namespace"] not in {"AWS/ApiGateway", "AWS/Lambda", "AWS/RDS"}:
                continue

            metric_id = build_metric_id(metric)
            metrics.append(
                {
                    "Id": metric_id,
                    "Label": metric_id,
                    "MetricStat": {
                        "Metric": metric,
                        "Period": PERIOD,
                        "Stat": "Average",
                    },
                }
            )

    print(f"Metrics: {len(metrics)}")
    results = defaultdict(list)

    next_token = None
    while next_token != False:
        kwargs = {
            "EndTime": datetime(2020, 5, 18),
            "MaxDatapoints": 100800,
            "MetricDataQueries": metrics,
            "StartTime": START_TIME[PERIOD],
        }
        if next_token:
            kwargs["NextToken"] = next_token

        response = cloudwatch.get_metric_data(**kwargs)

        assert response["Messages"] == []
        assert response["ResponseMetadata"]["HTTPStatusCode"] == 200
        next_token = response.get("NextToken", False)

        print(f"Results: {len(response['MetricDataResults'])}")
        for i, data in enumerate(response["MetricDataResults"]):
            if data["StatusCode"] not in {"Complete", "PartialData"}:
                print(data["StatusCode"])
            if i == 0 and data["Timestamps"]:
                print(data["Timestamps"][0], len(data["Timestamps"]))

            results[data["Label"]].extend(zip(data["Timestamps"], data["Values"]))

    for metric, values in sorted(results.items()):
        if not values:
            print(f"No data {metric}")
            continue

        print(f"{len(values):5d} {min(x[0] for x in values)} {metric}")
        with open(f"{metric}_{PERIOD}.json", "w") as fp:
            json.dump(values, fp, default=date_format, indent=2)


if __name__ == "__main__":
    sys.exit(main())
