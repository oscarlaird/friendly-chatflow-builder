
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChats } from '@/hooks/useChats';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Pencil, Check, X, Play, ArrowUpRight, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export function WorkflowList() {
  const { chats, loading, updateChatTitle, deleteChat } = useChats();
  const navigate = useNavigate();
  const [editId, setEditId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <div className="animate-pulse">Loading workflows...</div>
      </div>
    );
  }

  if (chats.length === 0) {
    return (
      <div className="py-12 flex flex-col items-center justify-center text-center">
        <div className="mb-4 p-4 rounded-full bg-primary/10">
          <FolderCog className="h-10 w-10 text-primary" />
        </div>
        <h3 className="text-xl font-semibold">No workflows found</h3>
        <p className="text-muted-foreground mb-6">
          Create your first workflow to get started
        </p>
      </div>
    );
  }

  const handleEditClick = (id: string, title: string) => {
    setEditId(id);
    setEditTitle(title);
  };

  const handleSaveTitle = async (id: string) => {
    if (editTitle.trim() !== '') {
      await updateChatTitle(id, editTitle);
      setEditId(null);
    }
  };

  const handleCancelEdit = () => {
    setEditId(null);
    setEditTitle('');
  };

  const handleDeleteWorkflow = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this workflow?')) {
      await deleteChat(id);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {chats.map((chat) => (
        <Card 
          key={chat.id} 
          className="hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => editId !== chat.id && navigate(`/workflow/${chat.id}`)}
        >
          <CardHeader className="pb-2">
            {editId === chat.id ? (
              <div className="flex items-center space-x-2" onClick={e => e.stopPropagation()}>
                <Input 
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  autoFocus
                  className="h-8"
                />
                <Button variant="ghost" size="icon" onClick={() => handleSaveTitle(chat.id)}>
                  <Check className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={handleCancelEdit}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{chat.title}</CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditClick(chat.id, chat.title);
                  }}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
            )}
            <CardDescription>
              Created {formatDistanceToNow(new Date(chat.created_at), { addSuffix: true })}
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            {/* We could show workflow description or status here */}
            <p className="text-sm text-muted-foreground line-clamp-2">
              {chat.description || "No description"}
            </p>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button 
              variant="outline" 
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/workflow/${chat.id}`);
              }}
            >
              <Play className="mr-1 h-4 w-4" /> 
              Run
            </Button>
            <div className="flex space-x-2">
              <Button
                variant="destructive"
                size="sm"
                onClick={(e) => handleDeleteWorkflow(chat.id, e)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/workflow/${chat.id}`);
                }}
              >
                <ArrowUpRight className="h-4 w-4" />
              </Button>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

// Import this icon for the empty state
import { FolderCog } from 'lucide-react';
