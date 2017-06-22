default: help

help: 
	@echo "python2 users:  make py2"
	@echo "python3 users:  make py3"

py2:
	python -m simpleHTTPServer 8021
	open http://localhost:8021

py3:
	python -m http.server 8021
	open http://localhost:8021
