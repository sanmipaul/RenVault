@echo off
echo Deploying RenVault contracts to testnet...

clarinet deployments generate --devnet
clarinet deployments apply --devnet

echo Deployment complete! Check Clarinet console for transaction IDs.