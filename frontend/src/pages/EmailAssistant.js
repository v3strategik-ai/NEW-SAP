import { useState } from 'react';
import axios from 'axios';
import { API, getAuthHeader } from '../App';
import Layout from '../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mail, Send, Sparkles, Copy, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

const EmailAssistant = ({ user, onLogout }) => {
  const [formData, setFormData] = useState({
    to: '',
    subject: '',
    context: '',
    tone: 'professional'
  });
  const [draftedEmail, setDraftedEmail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleDraftEmail = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${API}/email/draft`, formData, { headers: getAuthHeader() });
      setDraftedEmail(response.data);
      toast.success('Email drafted successfully!');
    } catch (error) {
      toast.error('Failed to draft email');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyEmail = () => {
    if (draftedEmail) {
      navigator.clipboard.writeText(draftedEmail.body);
      setCopied(true);
      toast.success('Email copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="space-y-6" data-testid="email-assistant-page">
        <div>
          <h1 className="text-4xl font-bold flex items-center gap-3">
            <Mail className="w-10 h-10 text-indigo-600" />
            Smart Email Assistant
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg mt-1">
            AI-powered email drafting and meeting summaries
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-0 shadow-md dark:bg-gray-800" data-testid="email-form">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                <Sparkles className="w-5 h-5 text-purple-600" />
                Draft Email
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleDraftEmail} className="space-y-4">
                <div>
                  <Label>To</Label>
                  <Input
                    value={formData.to}
                    onChange={(e) => setFormData({ ...formData, to: e.target.value })}
                    placeholder="recipient@company.com"
                    required
                    data-testid="email-to-input"
                  />
                </div>
                <div>
                  <Label>Subject</Label>
                  <Input
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="Email subject"
                    required
                    data-testid="email-subject-input"
                  />
                </div>
                <div>
                  <Label>Context / Key Points</Label>
                  <Textarea
                    value={formData.context}
                    onChange={(e) => setFormData({ ...formData, context: e.target.value })}
                    placeholder="What do you want to communicate? Include key points..."
                    rows={4}
                    required
                    data-testid="email-context-input"
                  />
                </div>
                <div>
                  <Label>Tone</Label>
                  <Select value={formData.tone} onValueChange={(value) => setFormData({ ...formData, tone: value })}>
                    <SelectTrigger data-testid="tone-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="friendly">Friendly</SelectItem>
                      <SelectItem value="formal">Formal</SelectItem>
                      <SelectItem value="casual">Casual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full" disabled={loading} data-testid="draft-email-button">
                  {loading ? (
                    <>Drafting...</>
                  ) : (
                    <><Send className="w-4 h-4 mr-2" />Draft Email</>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md dark:bg-gray-800" data-testid="email-preview">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="dark:text-gray-100">Email Preview</CardTitle>
                {draftedEmail && (
                  <Button
                    onClick={handleCopyEmail}
                    variant="outline"
                    size="sm"
                    data-testid="copy-email-button"
                  >
                    {copied ? <CheckCircle className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                    {copied ? 'Copied!' : 'Copy'}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {draftedEmail ? (
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-semibold">Subject:</Label>
                    <p className="mt-1 p-2 bg-gray-50 dark:bg-gray-700 rounded dark:text-gray-200">{draftedEmail.subject}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-semibold">Body:</Label>
                    <div className="mt-1 p-4 bg-gray-50 dark:bg-gray-700 rounded whitespace-pre-wrap text-sm dark:text-gray-200">
                      {draftedEmail.body}
                    </div>
                  </div>
                  {draftedEmail.suggestions && draftedEmail.suggestions.length > 0 && (
                    <div>
                      <Label className="text-sm font-semibold">AI Suggestions:</Label>
                      <ul className="mt-2 space-y-2">
                        {draftedEmail.suggestions.map((suggestion, index) => (
                          <li key={index} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                            <Sparkles className="w-4 h-4 mt-0.5 text-purple-600" />
                            <span>{suggestion}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <Mail className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Draft an email to see the preview here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default EmailAssistant;