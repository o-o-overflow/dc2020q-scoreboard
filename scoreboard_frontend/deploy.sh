#!/bin/sh

# Ensure OOO_S3_BUCKET is set
if [ -z "$OOO_S3_BUCKET" ]; then
    echo "\$OOO_S3_BUCKET is not set. Please source .env file."
    exit 1
fi

# Allow BUILD=prod to be set.
if [ -z "$BUILD" ]; then
    BUILD=dev
elif [[ $BUILD != "prod" ]]; then
    echo "Only BUILD=prod is supported. Goodbye!"
    exit 1
fi

# Production safety check
if [[ $BUILD == "prod" ]]; then
    echo "Are you sure you want to deploy to production? (y|N) "
    read response
    if [[ $response != "y" ]]; then
        echo "Goodbye!"
        exit 2
    fi
fi

sh -ac ". .env.$BUILD; ./node_modules/.bin/react-scripts build" \
  && rm build/static/*/*.map \
  && rm build/asset-manifest.json \
  && rm build/service-worker.js \
  && find build/static -regex '.*\.[cj]ss*' -exec sed -i '' '/^\/[/*]# sourceMappingURL/ d' {} \; \
  && aws --profile ooo s3 cp ./build/index.html s3://$OOO_S3_BUCKET/$BUILD/scoreboard/index.html --cache-control max-age=60 \
  && aws --profile ooo s3 sync build/ s3://$OOO_S3_BUCKET/$BUILD/scoreboard
