import RunnerPageClient from './RunnerPageClient';

interface RunnerPageProps {
  params: Promise<{
    name: string;
  }>;
}

export default async function RunnerPage({ params }: RunnerPageProps) {
      const { name } = await params;
  const runnerName = decodeURIComponent(name);
  
  return <RunnerPageClient runnerName={runnerName} />;
}