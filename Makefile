SRCS = deborah.ts
LIBS = node.d.ts

ALLSRC = $(addprefix src/, $(SRCS)) $(addprefix lib/, $(LIBS))

default :
	make deborah.js

run :
	node .

deborah.js : $(ALLSRC) Makefile
	tsc

clean :
	-rm deborah.js
	-rm *.wav

