SRCS = deborah.ts

ALLSRC := $(wildcard src/*.ts src/responder/*.ts src/driver/*.ts)

default :
	make deborah.js

run :
	node .

deborah.js : $(ALLSRC) Makefile
	tsc

clean :
	-rm deborah.js
	-rm *.wav

