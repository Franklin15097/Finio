#!/bin/bash
pm2 restart all || pm2 start all
pm2 status
