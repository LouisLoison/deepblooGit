# Shell to use with make
SHELL := /bin/bash
PROJECT := deepbloo-document-process
ENGINE := engine
SOURCES := src
LOCALPATH := $(CURDIR)
GITLAB_TOKEN := ''
COVERAGE_REPORT_DIR := $(CURDIR)/.coverage_reports
COVERAGE_XML_FILE := $(COVERAGE_REPORT_DIR)/xml/coverage_$(shell date +%Y-%m-%d-%Hh%Mmin%Ss).xml
PYLINT_RC = $(CURDIR)/.pylintrc

ifeq ($(OS),Windows_NT)
	OS_NAME := Windows
else
	OS_NAME := $(shell uname -s)
endif

VENV := source env/bin/activate; export PYTHONPATH=$(CURDIR)

all:
	@make check

machine:
	@echo 'OS detected is:' $(OS_NAME)

db:
	# sudo docker-compose -f stack.yml up -d

	pgloader --with "quote identifiers" pgloader.cmd
	# grant all on schema public to deepbloo;
	# grant all on ALL TABLES IN SCHEMA  public to deepbloo;



install:
	# Install python environment and dependencies
	cd data/production/documents && tar xpJf documentsTxt.tar.bz2
	python3 -m venv env
	$(VENV); pip install -r requirements.txt

spacy:
	$(VENV); python3 -m spacy download en_core_web_lg ; python3.7 -m spacy download en_core_web_sm
	$(VENV); python3 -m spacy download fr_core_news_sm ; python3.7 -m spacy download fr_core_news_lg

lint:
	@echo
	@echo "Running coding style and static analysis"
	$(VENV); cd $(LOCALPATH); find . -name "*.py" | xargs pylint --rcfile $(PYLINT_RC)

test:
	@echo
	@echo "Running unit tests"
	$(VENV); cd $(LOCALPATH); python3 -m unittest -bfv

populate:
	@echo
	@echo "Running unit tests"
	$(VENV); cd $(LOCALPATH); python3 src/populate.py

coverage:
	@echo
	@echo "Running test coverage"
	$(VENV); cd $(LOCALPATH); coverage run --source=$(SOURCES) --omit=*__init__.py,*/tests/* -m unittest -bfv > /dev/null
	@echo "Reporting test coverage"
	@$(VENV); cd $(LOCALPATH); coverage report -m
	@$(VENV); cd $(LOCALPATH); coverage html -d $(COVERAGE_REPORT_DIR)
	@echo Click here to open detailed coverage report: file://$(COVERAGE_REPORT_DIR)/index.html
	@make coverage_clean

coverage_clean:
	@$(VENV); cd $(LOCALPATH); coverage erase

radon:
	@#Read more about radon and code complexity at http://radon.readthedocs.io/en/latest/
	@echo
	@echo Computing code Cyclomatic Complexity
	@$(VENV); cd $(LOCALPATH); radon cc -s --min B --total-average  -s lib/ tests/
	@echo
	@echo Computing code Maintainability Index
	@$(VENV); cd $(LOCALPATH); radon mi -s lib/ tests/

docker_test:
	@echo
	@echo "Running unit tests in Docker (fresh install)"
	sudo gitlab-ci-multi-runner exec docker "unit tests"

check:
	@make lint
	@make test
	@make coverage
	@make radon

full_check:
	@make check
	@make docker_test




install_gitlab_runner:
	# Install gitlab runner for local tests of CI/CD
	ifeq ($(OS_NAME),Linux)
		# LINUX: Following the guide: https://docs.gitlab.com/runner/install/linux-manually.html
		sudo wget -O /usr/local/bin/gitlab-runner https://gitlab-runner-downloads.s3.amazonaws.com/latest/binaries/gitlab-runner-linux-amd64
		sudo chmod +x /usr/local/bin/gitlab-runner
		curl -sSL https://get.docker.com/ | sh
		sudo useradd --comment 'GitLab Runner' --create-home gitlab-runner --shell /bin/bash
		sudo gitlab-runner install --user=gitlab-runner --working-directory=/home/gitlab-runner
		sudo gitlab-runner start
		@make register_gitlab_runner
	endif
	ifeq ($(OS_NAME),Darwin)
		# MacOS: Following the guide: https://docs.gitlab.com/runner/install/osx.html
		sudo curl --output /usr/local/bin/gitlab-runner https://gitlab-runner-downloads.s3.amazonaws.com/latest/binaries/gitlab-runner-darwin-amd64
		sudo chmod +x /usr/local/bin/gitlab-runner
		curl -sSL https://get.docker.com/ | sh
		@make register_gitlab_runner
		cd ~
		gitlab-runner install
		gitlab-runner start

register_gitlab_runner:
		gitlab-runner register \
		  --non-interactive \
		  --url "https://gitlab.com/" \
		  --registration-token $(GITLAB_TOKEN) \
		  --description "python-3.7" \
		  --executor "docker" \
		  --docker-image python:3.7 \
		  --docker-postgres latest

# Minimal makefile for Sphinx documentation
#

# You can set these variables from the command line.
SPHINXOPTS    =
SPHINXBUILD   = sphinx-build
SPHINXPROJ    = DiliEngine
SOURCEDIR     = sphinx/source
BUILDDIR      = sphinx/build

# Put it first so that "make" without argument is like "make help".
help:
	@$(SPHINXBUILD) -M help "$(SOURCEDIR)" "$(BUILDDIR)" $(SPHINXOPTS) $(O)

.PHONY: help Makefile

# Catch-all target: route all unknown targets to Sphinx using the new
# "make mode" option.  $(O) is meant as a shortcut for $(SPHINXOPTS).
install-sphinx:
	@echo "Installing Sphinx for documentation."
	@echo "Read http://www.sphinx-doc.org/en/stable/tutorial.html for setup"
	$(VENV); pip install sphinx

# Catch-all target: route all unknown targets to Sphinx using the new
# "make mode" option.  $(O) is meant as a shortcut for $(SPHINXOPTS).
sphinx-build:
	$(VENV); sphinx-apidoc --force -o $(SOURCEDIR) $(LOCALPATH) --separate
	$(VENV); sphinx-build -b html $(SOURCEDIR) $(BUILDDIR)
