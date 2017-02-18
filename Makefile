default :
	make deborah.js

run :
	node .

deborah.js : deborah.ts
	tsc

clean :
	-rm deborah.js

