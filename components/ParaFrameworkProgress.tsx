interface ParaFrameworkProgressProps {
  progressStep: number;
  progressStatus: string;
}

export default function ParaFrameworkProgress({ progressStep, progressStatus }: ParaFrameworkProgressProps) {
  const steps = [
    'Checking for existing framework',
    'Analyzing workspace access',
    'Creating PARA databases',
    'Finalizing setup'
  ];

  return (
    <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
      <h3 className="font-medium text-blue-800 mb-3">Setting up your PARA framework</h3>
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <div className="relative h-1 w-full bg-blue-100 rounded-full overflow-hidden">
            <div
              className="absolute top-0 left-0 h-full bg-blue-500 rounded-full transition-all duration-300"
              style={{ width: `${progressStep * 25}%` }}
            />
          </div>
          <span className="text-xs text-blue-800 font-medium whitespace-nowrap">
            {progressStep}/4
          </span>
        </div>
        <p className="text-sm text-blue-700">{progressStatus}</p>
        <ul className="space-y-2">
          {steps.map((step, index) => {
            const stepNumber = index + 1;
            const isActive = progressStep >= stepNumber;
            
            return (
              <li 
                key={stepNumber}
                className={`flex items-center text-xs ${
                  isActive ? 'text-blue-700' : 'text-slate-400'
                }`}
              >
                <span
                  className={`inline-flex items-center justify-center w-5 h-5 mr-2 rounded-full ${
                    isActive ? 'bg-blue-500 text-white' : 'bg-slate-200'
                  }`}
                >
                  {stepNumber}
                </span>
                {step}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}