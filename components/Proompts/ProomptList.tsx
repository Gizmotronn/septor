import React, { useEffect, useState } from 'react';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';

const UserQueriesTable: React.FC = () => {
  const supabase = useSupabaseClient();
  const session = useSession();
  const [userQueries, setUserQueries] = useState<any[]>([]);

  useEffect(() => {
    const fetchUserQueries = async () => {
      if (session?.user) {
        const { data, error } = await supabase
          .from('proompts')
          .select('id, prompt_text, urlSafetyScore, created_at')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching user queries:', error.message);
        } else if (data) {
          setUserQueries(data);
        }
      }
    };

    fetchUserQueries();
  }, [session]);

  return (
    <div className="w-full max-w-screen-lg mx-auto p-4">
      <h2 className="text-3xl font-semibold mb-4">Your Queries</h2>
      <table className="min-w-full border-collapse border border-gray-300">
        <thead>
          <tr>
            <th className="p-2 border border-gray-300">Query</th>
            <th className="p-2 border border-gray-300">URL Safety Score</th>
            <th className="p-2 border border-gray-300">Created At</th>
          </tr>
        </thead>
        <tbody>
          {userQueries.map((query) => (
            <tr key={query.id}>
              <td className="p-2 border border-gray-300">{query.prompt_text}</td>
              <td className="p-2 border border-gray-300">{query.urlSafetyScore}%</td>
              <td className="p-2 border border-gray-300">
                {new Date(query.created_at).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserQueriesTable;