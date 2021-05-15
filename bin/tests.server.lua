local ReplicatedStorage = game:GetService("ReplicatedStorage")
local ServerScriptService = game:GetService("ServerScriptService")
local StarterPlayer = game:GetService("StarterPlayer")

local TestEZ = require(ReplicatedStorage.rbxts_include.node_modules.testez.src)

local Roots = {
  ReplicatedStorage.TS,
  ServerScriptService.TS,
  StarterPlayer.StarterPlayerScripts.TS
}
local results = TestEZ.TestBootstrap:run(Roots, TestEZ.Reporters.TextReporter)

if #results.errors > 0 or results.failureCount > 0 then
	error("Tests failed")
end