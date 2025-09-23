import ChatSidebar from '../ChatSidebar';

export default function ChatSidebarExample() {
  return (
    <div className="min-h-screen bg-background flex">
      <ChatSidebar 
        isOpen={true} 
        onClose={() => console.log('Sidebar close triggered')} 
      />
      <div className="flex-1 p-4 lg:ml-80">
        <p className="text-center text-muted-foreground">Chat sidebar displayed on the left</p>
      </div>
    </div>
  );
}