export NAME_PREFIX = pds-portal
export DB_CONTAINER_NAME = $(NAME_PREFIX)-db
export FRONTEND_CONTAINER_NAME = $(NAME_PREFIX)-frontend
export WORDPRESS_CONTAINER_NAME = ${NAME_PREFIX}-wordpress
export WPCLI_CONTAINER_NAME = ${NAME_PREFIX}-wpcli
export RUN_OPTIONS = 
export DOCKER_COMPOSE_YML = ./apps/docker-compose.yml

# ----------------------------------------------------------------------------
# ----------------------------------------------------------------------------
# Secrets Detection Receipes
# 
# Reference:
# https://github.com/NASA-PDS/nasa-pds.github.io/wiki/Git-and-Github-Guide#detect-secrets
#

audit-secrets:	## Audit .secrets.baseline
	detect-secrets audit .secrets.baseline

update-secrets-baseline:	## Updates .secrets.baseline
	detect-secrets scan --disable-plugin AbsolutePathDetectorExperimental \
		--exclude-files '\.secrets..*' \
		--exclude-files '\.git.*' \
		--exclude-files '\.pre-commit-config\.yaml' \
		--exclude-files 'node_modules' \
		--exclude-files 'src/external/react-filter-box-REPO/react-filter-box-mod/src/example' > .secrets.baseline

#--exclude-files 'src\/external\/react\-filter\-box-REPO\/react\-filter\-box\-mod\/src\/example' > .secrets.baseline

# ----------------------------------------------------------------------------
# Self-Documented Makefile
# ref: http://marmelab.com/blog/2016/02/29/auto-documented-makefile.html
# ----------------------------------------------------------------------------
help:						## (DEFAULT) This help information
	@echo ====================================================================
	@grep -E '^## .*$$'  \
		$(MAKEFILE_LIST)  \
		| awk 'BEGIN { FS="## " }; {printf "\033[33m%-20s\033[0m \n", $$2}'
	@echo
	@grep -E '^[0-9a-zA-Z_-]+:.*?## .*$$'  \
		$(MAKEFILE_LIST)  \
		| awk 'BEGIN { FS=":.*?## " }; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'  \
#		 | sort
.PHONY: help
.DEFAULT_GOAL := help
