#!/bin/sh

./node_modules/.bin/react-scripts build \
  && rm build/static/*/*.map \
  && find build/static -regex '.*\.[cj]ss*' -exec sed -i '' '/^\/[/*]# sourceMappingURL/ d' {} \; \
  && aws s3 sync --profile ooo build/ s3://oooverflow-scoreboard
