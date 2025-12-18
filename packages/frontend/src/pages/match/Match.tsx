import Matching from './components/Matching';

export default function Match() {
  return (
    <div className="relative h-screen w-screen overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Retro grid background */}
      <div className="absolute inset-1 opacity-20">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
                        linear-gradient(rgba(139, 92, 246, 0.3) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(139, 92, 246, 0.3) 1px, transparent 1px)
                    `,
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      {/* TODO: need to connect the screens according to the game flow */}
      <Matching />
    </div>
  );
}
