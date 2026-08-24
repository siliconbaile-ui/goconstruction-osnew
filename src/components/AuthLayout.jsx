import React from "react";

const MARCA_URL = 'https://media.base44.com/images/public/6a8536b631a67708e1537e3c/08dbc115f_generated_image.png';

export default function AuthLayout({ icon: Icon, title, subtitle, footer, children }) {
  return (
    <div
      className="min-h-[100dvh] flex items-center justify-center bg-background px-4 py-8"
      style={{
        paddingTop: 'max(2rem, env(safe-area-inset-top))',
        paddingBottom: 'max(2rem, env(safe-area-inset-bottom))',
      }}
    >
      <div className="w-full max-w-md min-w-0">
        <div className="text-center mb-8 sm:mb-10">
          <img
            src={MARCA_URL}
            alt="GoConstruction OS"
            className="w-14 h-14 rounded-2xl mx-auto mb-4 object-cover ring-1 ring-hairline"
          />
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground break-words">{title}</h1>
          {subtitle && <p className="text-sm sm:text-base text-muted-foreground mt-2 break-words">{subtitle}</p>}
          {Icon && (
            <div className="mt-3 inline-flex items-center gap-1.5 font-mono text-[10px] tracking-[0.18em] text-muted-foreground">
              <Icon className="w-3 h-3" aria-hidden="true" />
              COMMAND CENTER · OBRA
            </div>
          )}
        </div>
        <div className="bg-card rounded-2xl shadow-sm border border-border p-5 sm:p-8">
          {children}
        </div>
        {footer && (
          <p className="text-center text-sm text-muted-foreground mt-6 px-2 break-words">{footer}</p>
        )}
      </div>
    </div>
  );
}