SRCS = deborah.ts

ALLSRC := $(wildcard src/*.ts src/responder/*.ts src/driver/*.ts)

TARGET = js/deborah.js

TYPEDOC = docs/typedoc/index.html

default :
	make $(TARGET)

.FORCE:

run : $(TARGET)
	node $(TARGET)

doc :
	make $(TYPEDOC)

js/deborah.js : $(ALLSRC) tsconfig.json Makefile .FORCE
	tsc

docs/typedoc/index.html : $(TARGET)
	typedoc --out ./docs/typedoc/ ./src/

clean :
	-rm -rf js/*
	-rm -rf docs/typedoc/*
	-rm *.wav

test:
	npm install --only=dev
	-rm $(TARGET)
	make $(TARGET)
