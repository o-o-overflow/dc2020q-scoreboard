#!/bin/sh

./node_modules/.bin/react-scripts build \
  && rm build/static/*/*.map \
  && find build/static -regex '.*\.[cj]ss*' -exec sed -i '' '/^\/[/*]# sourceMappingURL/ d' {} \; \
  && aws --profile ooo s3 cp ./build/index.html s3://oooverflow-scoreboard/index.html --cache-control max-age=60 \
  && aws --profile ooo s3 sync build/ s3://oooverflow-scoreboard
