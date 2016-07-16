SET REDISTOGO_URL=redis://redistogo:cdc1c4f5a4f9ea8429387f63eadbccdf@hoki.redistogo.com:10765/
REM this is teamzone
REM SET SAUCE_USERNAME=teamzone
REM SET SAUCE_ACCESS_KEY=90d72ec7-6bef-4d63-995d-f02343c866cb
REM This is Code Genesys
REM SET SAUCE_USERNAME=nzcodegenesys
REM SET SAUCE_ACCESS_KEY=247c7942-8d82-444c-b2f5-847ff61547e3
REM This is Info About Agile
SET SAUCE_USERNAME=infoaboutagilecom
SET SAUCE_ACCESS_KEY=0645666e-e4f3-4582-890c-9aedc7b0a178
SET TEAMZONE_URL=http://localhost:3000
node node_modules\\mocha\\bin\\_mocha -t 5000 %1