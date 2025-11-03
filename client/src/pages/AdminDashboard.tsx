import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Shield, Plus, Trash2, Save, Sparkles } from "lucide-react";
import { Label } from "@/components/ui/label";

interface EventTrigger {
  trigger: string;
  response: string;
}

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [basePrompt, setBasePrompt] = useState("");
  const [eventTriggers, setEventTriggers] = useState<EventTrigger[]>([]);
  const [randomInjections, setRandomInjections] = useState<string[]>([]);

  useEffect(() => {
    checkAdminStatus();
    loadModelConfig();
  }, []);

  const checkAdminStatus = async () => {
    try {
      await apiRequest("/api/admin/status");
    } catch (error) {
      setLocation("/admin/login");
    }
  };

  const loadModelConfig = async () => {
    try {
      const data = await apiRequest("/api/admin/model-config/j-realistic");
      setBasePrompt(data.basePrompt || "");
      setEventTriggers(Array.isArray(data.eventTriggers) ? data.eventTriggers : []);
      setRandomInjections(Array.isArray(data.randomInjections) ? data.randomInjections : []);
    } catch (error) {
      console.error("Failed to load model config:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await apiRequest("/api/admin/model-config", {
        method: "POST",
        body: JSON.stringify({
          modeKey: "j-realistic",
          basePrompt: basePrompt || "You are a helpful AI assistant.",
          eventTriggers: eventTriggers.filter(t => t.trigger && t.response),
          randomInjections: randomInjections.filter(m => m.trim()),
        }),
      });

      toast({
        title: "Success",
        description: "Model configuration saved successfully",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save configuration",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const addEventTrigger = () => {
    setEventTriggers([...eventTriggers, { trigger: "", response: "" }]);
  };

  const updateEventTrigger = (index: number, field: keyof EventTrigger, value: string) => {
    const updated = [...eventTriggers];
    updated[index][field] = value;
    setEventTriggers(updated);
  };

  const removeEventTrigger = (index: number) => {
    setEventTriggers(eventTriggers.filter((_, i) => i !== index));
  };

  const addRandomInjection = () => {
    setRandomInjections([...randomInjections, ""]);
  };

  const updateRandomInjection = (index: number, value: string) => {
    const updated = [...randomInjections];
    updated[index] = value;
    setRandomInjections(updated);
  };

  const removeRandomInjection = (index: number) => {
    setRandomInjections(randomInjections.filter((_, i) => i !== index));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container max-w-4xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-muted-foreground">Configure J-Realistic AI Model</p>
            </div>
          </div>
          <Button
            data-testid="button-save-config"
            onClick={handleSave}
            disabled={isSaving}
            className="gap-2"
          >
            <Save className="h-4 w-4" />
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Base Prompt
            </CardTitle>
            <CardDescription>
              The core personality and behavior for the j-realistic model
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              data-testid="input-base-prompt"
              value={basePrompt}
              onChange={(e) => setBasePrompt(e.target.value)}
              placeholder="You are a helpful AI assistant..."
              rows={6}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Event Triggers</CardTitle>
                <CardDescription>
                  Set specific responses for certain user inputs (e.g., when user says "hello")
                </CardDescription>
              </div>
              <Button
                data-testid="button-add-trigger"
                onClick={addEventTrigger}
                size="sm"
                variant="outline"
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Trigger
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {eventTriggers.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No event triggers configured. Click "Add Trigger" to create one.
              </p>
            )}
            {eventTriggers.map((trigger, index) => (
              <div key={index} className="flex gap-2" data-testid={`trigger-${index}`}>
                <div className="flex-1 space-y-2">
                  <Label className="text-xs text-muted-foreground">When user says...</Label>
                  <Input
                    data-testid={`input-trigger-${index}`}
                    value={trigger.trigger}
                    onChange={(e) => updateEventTrigger(index, "trigger", e.target.value)}
                    placeholder="hello"
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <Label className="text-xs text-muted-foreground">Respond with...</Label>
                  <Input
                    data-testid={`input-response-${index}`}
                    value={trigger.response}
                    onChange={(e) => updateEventTrigger(index, "response", e.target.value)}
                    placeholder="Hey there! How can I help you?"
                  />
                </div>
                <Button
                  data-testid={`button-remove-trigger-${index}`}
                  onClick={() => removeEventTrigger(index)}
                  variant="ghost"
                  size="icon"
                  className="mt-7"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Random Message Injections</CardTitle>
                <CardDescription>
                  Messages randomly injected before AI responses (10% chance each time)
                </CardDescription>
              </div>
              <Button
                data-testid="button-add-injection"
                onClick={addRandomInjection}
                size="sm"
                variant="outline"
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Message
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {randomInjections.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No random injections configured. Click "Add Message" to create one.
              </p>
            )}
            {randomInjections.map((message, index) => (
              <div key={index} className="flex gap-2" data-testid={`injection-${index}`}>
                <Input
                  data-testid={`input-injection-${index}`}
                  value={message}
                  onChange={(e) => updateRandomInjection(index, e.target.value)}
                  placeholder="Random message to inject before AI response..."
                />
                <Button
                  data-testid={`button-remove-injection-${index}`}
                  onClick={() => removeRandomInjection(index)}
                  variant="ghost"
                  size="icon"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
