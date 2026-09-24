import React from 'react';
import { CheckCircle2, Circle, Clock, AlertCircle } from 'lucide-react';
import { TrackingTimelineStep } from '../types';

interface TimelineProgressProps {
  steps: TrackingTimelineStep[];
}

export const TimelineProgress: React.FC<TimelineProgressProps> = ({ steps }) => {
  return (
    <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-[11px] sm:before:left-[15px] before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
      {steps.map((step, idx) => {
        let iconNode;
        let badgeBg = 'bg-white text-slate-300 border-slate-300';

        if (step.completed) {
          badgeBg = 'bg-emerald-500 text-white border-emerald-500 shadow-sm shadow-emerald-500/20';
          iconNode = <CheckCircle2 className="w-4 h-4" />;
        } else if (step.current) {
          badgeBg = 'bg-hospital-600 text-white border-hospital-600 shadow-sm shadow-hospital-500/30 animate-pulse';
          iconNode = <Clock className="w-4 h-4" />;
        } else {
          badgeBg = 'bg-slate-100 text-slate-400 border-slate-300';
          iconNode = <Circle className="w-3.5 h-3.5" />;
        }

        return (
          <div key={step.stepKey || idx} className="relative group">
            {/* Step Marker */}
            <div
              className={`absolute -left-[30px] sm:-left-[38px] top-0.5 w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 flex items-center justify-center transition-all ${badgeBg}`}
            >
              {iconNode}
            </div>

            {/* Step Body */}
            <div className={`p-4 rounded-xl border transition-all ${
              step.current 
                ? 'bg-hospital-50/70 border-hospital-200 shadow-sm' 
                : step.completed
                ? 'bg-white border-slate-200'
                : 'bg-slate-50/50 border-slate-200/60 opacity-60'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                <h4 className={`text-sm font-bold ${step.current ? 'text-hospital-900' : 'text-slate-800'}`}>
                  {step.title}
                </h4>
                {step.timestamp && (
                  <span className="text-xs text-slate-500 font-medium">
                    {new Date(step.timestamp).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">{step.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
