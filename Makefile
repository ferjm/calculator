build:
	sjs -r -o app/js/smart_worker/smartworker.js app/js/smart_worker/smartworker.sjs


PROFILE_DIR=/tmp/maple_profile_dir
MAPLE_DIR=/home/vnicolas/mozilla/code/maple/
run: build
	rm -rf ${PROFILE_DIR} && mkdir ${PROFILE_DIR} && ${MAPLE_DIR}./mach run -profile ${PROFILE_DIR} http://gaiamobile.org/calculator/app/index.html
