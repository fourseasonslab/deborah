SRCS = deborah.ts

ALLSRC = $(addprefix src/, $(SRCS))

default :
	make deborah.js

run :
	node .

deborah.js : $(ALLSRC) Makefile
	tsc

clean :
	-rm deborah.js
	-rm *.wav

