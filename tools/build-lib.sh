mkdir -p lambda/layer/deepbloo/nodejs/node_modules/deepbloo/ ||\
	rm lambda/layer/deepbloo/nodejs/node_modules/deepbloo/*
cp -a lambda/libjs/* lambda/layer/deepbloo/nodejs/node_modules/deepbloo/
