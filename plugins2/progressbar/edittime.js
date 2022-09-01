﻿function GetPluginSettings()
{
	return {
		"name":			"Progress bar",
		"id":			"progressbar",
		"version":		"1.0",
		"description":	"A browser-styled progress bar to show the amount of completion of a task.",
		"author":		"Scirra",
		"help url":		"http://www.scirra.com/manual/180/progress-bar",
		"category":		"Form controls",
		"type":			"world",			// appears in layout
		"rotatable":	false,
		"flags":		pf_position_aces | pf_size_aces
	};
};

////////////////////////////////////////
// Parameter types:
// AddNumberParam(label, description [, initial_string = "0"])			// a number
// AddStringParam(label, description [, initial_string = "\"\""])		// a string
// AddAnyTypeParam(label, description [, initial_string = "0"])			// accepts either a number or string
// AddCmpParam(label, description)										// combo with equal, not equal, less, etc.
// AddComboParamOption(text)											// (repeat before "AddComboParam" to add combo items)
// AddComboParam(label, description [, initial_selection = 0])			// a dropdown list parameter
// AddObjectParam(label, description)									// a button to click and pick an object type
// AddLayerParam(label, description)									// accepts either a layer number or name (string)
// AddLayoutParam(label, description)									// a dropdown list with all project layouts
// AddKeybParam(label, description)										// a button to click and press a key (returns a VK)
// AddAnimationParam(label, description)								// a string intended to specify an animation name
// AddAudioFileParam(label, description)								// a dropdown list with all imported project audio files

////////////////////////////////////////
// Conditions

// AddCondition(id,					// any positive integer to uniquely identify this condition
//				flags,				// (see docs) cf_none, cf_trigger, cf_fake_trigger, cf_static, cf_not_invertible,
//									// cf_deprecated, cf_incompatible_with_triggers, cf_looping
//				list_name,			// appears in event wizard list
//				category,			// category in event wizard list
//				display_str,		// as appears in event sheet - use {0}, {1} for parameters and also <b></b>, <i></i>
//				description,		// appears in event wizard dialog when selected
//				script_name);		// corresponding runtime function name
				
AddCondition(0, cf_trigger, "On clicked", "Progress bar", "On clicked", "Triggered when the progress bar is clicked.", "OnClicked");

AddCmpParam("Comparison", "How to compare the current progress.");
AddNumberParam("Value", "Progress value to compare to.");
AddCondition(1, cf_none, "Compare progress", "Progress bar", "Progress {0} <i>{1}</i>", "Compare the current progress value.", "CompareProgress");

////////////////////////////////////////
// Actions

// AddAction(id,				// any positive integer to uniquely identify this action
//			 flags,				// (see docs) af_none, af_deprecated
//			 list_name,			// appears in event wizard list
//			 category,			// category in event wizard list
//			 display_str,		// as appears in event sheet - use {0}, {1} for parameters and also <b></b>, <i></i>
//			 description,		// appears in event wizard dialog when selected
//			 script_name);		// corresponding runtime function name

AddStringParam("Tooltip", "The tooltip to set on the progress bar.");
AddAction(0, af_none, "Set tooltip", "Progress bar", "Set tooltip to {0}", "Set the progress bar's tooltip.", "SetTooltip");

AddComboParamOption("Invisible");
AddComboParamOption("Visible");
AddComboParam("Visibility", "Choose whether to hide or show the progress bar.");
AddAction(1, af_none, "Set visible", "Appearance", "Set <b>{0}</b>", "Hide or show the progress bar.", "SetVisible");

AddStringParam("Property name", "A CSS property name to set on the control.", "\"color\"");
AddStringParam("Value", "A string to assign as the value for this CSS property.", "\"red\"");
AddAction(2, af_none, "Set CSS style", "Appearance", "Set CSS style {0} to {1}", "Set a CSS style on the control.", "SetCSSStyle");

AddNumberParam("Value", "The value to set for the progress.");
AddAction(3, af_none, "Set progress", "Progress bar", "Set progress to <b>{0}</b>", "Set the progress value for the bar.", "SetProgress");

AddNumberParam("Maximum", "The new maximum value for the progress.");
AddAction(4, af_none, "Set maximum", "Progress bar", "Set maximum to <b>{0}</b>", "Set the maximum progress value for the bar.", "SetMaximum");

AddAction(5, af_none, "Make indeterminate", "Progress bar", "Make indeterminate", "Make the progress bar show indeterminate (unknown) progress.", "SetIndeterminate");

////////////////////////////////////////
// Expressions

// AddExpression(id,			// any positive integer to uniquely identify this expression
//				 flags,			// (see docs) ef_none, ef_deprecated, ef_return_number, ef_return_string,
//								// ef_return_any, ef_variadic_parameters (one return flag must be specified)
//				 list_name,		// currently ignored, but set as if appeared in event wizard
//				 category,		// category in expressions panel
//				 exp_name,		// the expression name after the dot, e.g. "foo" for "myobject.foo" - also the runtime function name
//				 description);	// description in expressions panel

AddExpression(0, ef_return_number, "", "Progress bar", "Progress", "Current progress value.");
AddExpression(1, ef_return_number, "", "Progress bar", "Maximum", "Current maximum progress value.");

ACESDone();

// Property grid properties for this plugin
var property_list = [
	new cr.Property(ept_float,	"Value",				"0",		"Initial value of the progress bar."),
	new cr.Property(ept_float,	"Maximum",				"100",		"The maximum value of the progress bar. Set to 0 for an indeterminate progress bar."),
	new cr.Property(ept_text,	"Tooltip",				"",			"Display this text when hovering the mouse over the control."),
	new cr.Property(ept_combo,	"Initial visibility",	"Visible",	"Choose whether the progress bar is visible on startup.", "Invisible|Visible"),
	new cr.Property(ept_text,	"ID (optional)",		"",			"An ID for the control allowing it to be styled with CSS from the page HTML.")
	];
	
// Called by IDE when a new object type is to be created
function CreateIDEObjectType()
{
	return new IDEObjectType();
}

// Class representing an object type in the IDE
function IDEObjectType()
{
	assert2(this instanceof arguments.callee, "Constructor called as a function");
}

// Called by IDE when a new object instance of this type is to be created
IDEObjectType.prototype.CreateInstance = function(instance)
{
	return new IDEInstance(instance);
}

// Class representing an individual instance of an object in the IDE
function IDEInstance(instance, type)
{
	assert2(this instanceof arguments.callee, "Constructor called as a function");
	
	// Save the constructor parameters
	this.instance = instance;
	this.type = type;
	
	// Set the default property values from the property table
	this.properties = {};
	
	for (var i = 0; i < property_list.length; i++)
		this.properties[property_list[i].name] = property_list[i].initial_value;
		
	// Plugin-specific variables
	this.just_inserted = false;
}

IDEInstance.prototype.OnCreate = function()
{
	this.instance.SetHotspot(new cr.vector2(0, 0));
}

IDEInstance.prototype.OnInserted = function()
{
	this.instance.SetSize(new cr.vector2(200, 25));
}

IDEInstance.prototype.OnDoubleClicked = function()
{
}

// Called by the IDE after a property has been changed
IDEInstance.prototype.OnPropertyChanged = function(property_name)
{
}

IDEInstance.prototype.OnRendererInit = function(renderer)
{
}
	
// Called to draw self in the editor
IDEInstance.prototype.Draw = function(renderer)
{
	renderer.SetTexture(null);
	var quad = this.instance.GetBoundingQuad();

	renderer.Fill(quad, cr.RGB(224, 224, 224));
	renderer.Outline(quad, cr.RGB(0, 0, 0));
}

IDEInstance.prototype.OnRendererReleased = function(renderer)
{
}