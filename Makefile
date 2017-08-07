SRCS = deborah.ts

ALLSRC := $(wildcard src/*.ts src/responder/*.ts)

default :
	make deborah.js

run :
	node .

deborah.js : $(ALLSRC) Makefile
	tsc

clean :
	-rm deborah.js
	-rm *.wav

test:
	npm install --only=dev
	-rm deborah.js
	make deborah.js
