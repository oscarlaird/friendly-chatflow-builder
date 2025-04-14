import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Pencil, Check, X, Play, ArrowUpRight, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { FolderCog } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Icons } from '@/components/ui/icons';
import { Badge } from '@/components/ui/badge';
import { APP_CONFIG } from '@/hooks/useOAuthFlow';
import { OAuthIcon, OAuthProviderType } from '@/components/ui/oauth-icons';

export function WorkflowList() {
  const [chats, setChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [editId, setEditId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  // Fetch user-specific chats
  useEffect(() => {
    if (!user) {
      setChats([]);
      setLoading(false);
      return;
    }

    const fetchUserChats = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('chats')
        .select('*')
        .eq('uid', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching chats:', error);
        setLoading(false);
        return;
      }

      setChats(data || []);
      setLoading(false);
    };

    fetchUserChats();
  }, [user]);

  const updateChatTitle = async (id: string, newTitle: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('chats')
      .update({ title: newTitle })
      .eq('id', id)
      .eq('uid', user.id);

    if (error) {
      console.error('Error updating chat title:', error);
      return;
    }

    // Optimistically update the local state
    setChats(chats.map(chat => 
      chat.id === id ? { ...chat, title: newTitle } : chat
    ));
    setEditId(null);
  };

  const deleteChat = async (id: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('chats')
      .delete()
      .eq('id', id)
      .eq('uid', user.id);

    if (error) {
      console.error('Error deleting chat:', error);
      return;
    }

    // Optimistically remove from local state
    setChats(chats.filter(chat => chat.id !== id));
  };

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

  // Helper function to render app integration icons
  const renderAppIcons = (apps: string[] | null) => {
    if (!apps || apps.length === 0) return null;
    
    return (
      <div className="flex items-center gap-1 mt-2">
        {apps.map(app => {
          // Check if the app is a valid OAuth provider type
          const isValidProvider = app === 'google_sheets' || app === 'gmail' || app === 'outlook';
          if (!isValidProvider) return null;

          const providerApp = app as OAuthProviderType;
          
          return (
            <Badge key={app} variant="outline" className="px-1.5 py-0.5">
              <OAuthIcon 
                provider={providerApp}
                isConnected={true}
                size={12}
                className="mr-1"
              />
              <span className="text-xs">{APP_CONFIG[app as keyof typeof APP_CONFIG]?.name || app}</span>
            </Badge>
          );
        })}
      </div>
    );
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
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => updateChatTitle(chat.id, editTitle)}
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setEditId(null)}
                >
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
                    setEditId(chat.id);
                    setEditTitle(chat.title);
                  }}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
            )}
            <CardDescription>
              Created {formatDistanceToNow(new Date(chat.created_at), { addSuffix: true })}
            </CardDescription>
            {/* Show app integration icons */}
            {renderAppIcons(chat.apps)}
          </CardHeader>
          <CardContent className="pb-2">
            <p className="text-sm text-muted-foreground line-clamp-2">
              Workflow information
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
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/workflow/${chat.id}`);
                }}
              >
                <ArrowUpRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-destructive text-destructive hover:bg-destructive/10"
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm('Are you sure you want to delete this workflow?')) {
                    deleteChat(chat.id);
                  }
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
