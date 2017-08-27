SRCS = deborah.ts

ALLSRC := $(wildcard src/*.ts src/responder/*.ts src/driver/*.ts)

TARGET = js/deborah.js

default :
	make $(TARGET)

run : $(TARGET)
	node $(TARGET)

js/deborah.js : $(ALLSRC) tsconfig.json Makefile
	tsc

clean :
	-rm $(TARGET)
	-rm *.wav

test:
	npm install --only=dev
	-rm $(TARGET)
	make $(TARGET)
