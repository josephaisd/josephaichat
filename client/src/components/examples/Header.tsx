import Header from '../Header';

export default function HeaderExample() {
  return (
    <div className="min-h-screen bg-background">
      <Header onToggleSidebar={() => console.log('Sidebar toggle triggered')} />
      <div className="pt-20 p-4">
        <div className="text-center">
          <p className="text-muted-foreground">Header component displayed above</p>
        </div>
      </div>
    </div>
  );
}