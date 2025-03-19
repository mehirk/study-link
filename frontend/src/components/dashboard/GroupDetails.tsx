import { useState } from "react";
import { Card, CardHeader, CardContent } from "@components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@components/ui/tabs";

interface GroupDetailsProps {
  groupId: number;
}

const GroupDetails = ({ groupId }: GroupDetailsProps) => {
  // Mock data - in a real app, this would come from an API
  const group = {
    id: groupId,
    name: "Group Name",
    description: "Description",
  };

  const [activeTab, setActiveTab] = useState("discussions");

  const tabs = [
    { id: "discussions", label: "Discussions" },
    { id: "files", label: "Files & Resources" },
    { id: "members", label: "Members" },
    { id: "academic", label: "Academic/Progress" },
    { id: "settings", label: "Settings" },
  ];

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <h1 className="text-2xl font-semibold">{group.name}</h1>
        <p className="text-muted-foreground">{group.description}</p>
      </CardHeader>

      <CardContent className="flex-1 p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="relative h-9 rounded-none border-b-2 border-b-transparent bg-transparent px-4 pb-3 pt-2 font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {tabs.map((tab) => (
            <TabsContent
              key={tab.id}
              value={tab.id}
              className="flex-1 border-none p-6 data-[state=active]:flex items-center justify-center"
            >
              <p className="text-muted-foreground">
                {tab.label} content will go here
              </p>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default GroupDetails; 