local ReplicatedStorage = game:GetService("ReplicatedStorage")
local ServerScriptService = game:GetService("ServerScriptService")
local isRobloxCli, ProcessService = pcall(game.GetService, game, "ProcessService")

local TestEZ = require(ReplicatedStorage.include.node_modules.testez.src)

local Roots = {
  ReplicatedStorage.TS,
  ServerScriptService.TS,
}
local results = TestEZ.TestBootstrap:run(Roots, TestEZ.Reporters.TextReporter)

local statusCode = results.failureCount == 0 and 0 or 1

if __LEMUR__ then
	if results.failureCount > 0 then
		os.exit(statusCode)
	end
elseif isRobloxCli then
	ProcessService:Exit(statusCode)
end
