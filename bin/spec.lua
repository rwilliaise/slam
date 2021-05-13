--[[
	Loads our library and all of its dependencies, then runs tests using TestEZ.
]]

-- This makes sure we can load Lemur and other libraries that depend on init.lua
package.path = package.path .. ";?/init.lua"

-- If this fails, make sure you've cloned all Git submodules of this repo!
local lemur = require("modules.lemur")

-- Create a virtual Roblox tree
local habitat = lemur.Habitat.new()

-- We'll put all of our library code and dependencies here
local ReplicatedStorage = habitat.game:GetService("ReplicatedStorage")
local ServerScriptStorage = habitat.game:GetService("ServerScriptService")
local StarterPlayer = habitat.game:GetService("StarterPlayer")
local StarterPlayerScripts = StarterPlayer:WaitForChild("StarterPlayerScripts")

-- If you add any dependencies, add them to this table so they'll be loaded!
local LOAD_MODULES = {
	{"out/server", ServerScriptStorage, "TS"},
	{"out/shared", ReplicatedStorage, "TS"},
	{"out/client", StarterPlayerScripts, "TS"}
}

-- Load all of the modules specified above
for _, module in ipairs(LOAD_MODULES) do
	local container = habitat:loadFromFs(module[1])
	container.Name = module[3]
	container.Parent = module[2]
end

local include = habitat:loadFromFs("include")
include.Name = "include"
include.Parent = ReplicatedStorage

local modules = habitat:loadFromFs("node_modules/@rbxts")
modules.Name = "node_modules"
modules.Parent = include

local runTests = habitat:loadFromFs("bin/tests.server.lua")

habitat:require(runTests)