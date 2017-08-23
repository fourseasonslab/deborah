SRCS = deborah.ts

ALLSRC := $(wildcard src/*.ts src/responder/*.ts src/driver/*.ts)

default :
	make deborah.js

run : deborah.js
	node .

deborah.js : $(ALLSRC) tsconfig.json Makefile
	tsc

clean :
	-rm deborah.js
	-rm *.wav

test:
	npm install --only=dev
	-rm deborah.js
	make deborah.js
