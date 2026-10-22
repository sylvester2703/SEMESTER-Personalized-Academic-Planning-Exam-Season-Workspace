import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: todos, error } = await supabase.from('todos').select();

  return (
    <div className="p-8 max-w-xl mx-auto font-sans">
      <div className="flex items-center justify-between mb-4 pb-2 border-b">
        <h1 className="text-xl font-bold">Supabase Integration Test</h1>
        <a href="/" className="text-sm text-emerald-600 hover:underline">
          &larr; Back to SEMESTER Planner
        </a>
      </div>

      {error ? (
        <div className="p-4 rounded bg-red-50 text-red-700 text-sm">
          <strong>Supabase query error:</strong> {error.message}
        </div>
      ) : (
        <ul className="list-disc pl-5 space-y-1">
          {todos?.map((todo: any) => (
            <li key={todo.id}>{todo.name}</li>
          ))}
        </ul>
      )}

      {(!todos || todos.length === 0) && !error && (
        <p className="text-sm text-gray-500 italic">
          Connected to Supabase. No rows found in table 'todos' yet.
        </p>
      )}
    </div>
  );
}
