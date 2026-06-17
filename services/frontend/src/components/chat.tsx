import React, { useState, useEffect, useRef } from 'react';

interface Message {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  time: string;
}

interface ChatProps {
  widget?: boolean;
}

const Chat: React.FC<ChatProps> = ({ widget = false }) => {
    const [userInput, setUserInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [open, setOpen] = useState(!widget);
    
    // Estado real para almacenar el flujo de la conversación
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'init',
            sender: 'bot',
            text: '¿En qué puedo ayudarte hoy?',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
    ]);

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const chatEndRef = useRef<HTMLDivElement>(null);

    // Auto-ajuste de la altura del textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [userInput]);

    // Auto-scroll al final del chat cuando llega un mensaje nuevo o está escribiendo
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    const handleSend = async () => {
        const cleanInput = userInput.trim();
        if (!cleanInput || isTyping) return;

        const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        // 1. Añadir el mensaje del usuario al chat inmediatamente
        const userMessage: Message = {
            id: `user-${Date.now()}`,
            sender: 'user',
            text: cleanInput,
            time: currentTime
        };

        setMessages((prev) => [...prev, userMessage]);
        setUserInput('');
        setIsTyping(true);

        try {
            // 2. Petición real a tu microservicio Dockerizado (corriendo en el puerto 5001 de tu máquina)
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: cleanInput }),
            });

            if (!response.ok) {
                throw new Error('Error en la respuesta del servidor de IA');
            }

            const data = await response.json();

            // 3. Añadir la respuesta real de la IA local
            const botMessage: Message = {
                id: `bot-${Date.now()}`,
                sender: 'bot',
                text: data.reply || 'No obtuve una respuesta válida.',
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };

            setMessages((prev) => [...prev, botMessage]);

        } catch (error) {
            console.error('Error al conectar con la IA:', error);
            
            // Mensaje de error visual para el usuario si se cae la red o el contenedor
            const errorMessage: Message = {
                id: `err-${Date.now()}`,
                sender: 'bot',
                text: 'Lo siento, en este momento no puedo procesar tu solicitud. Asegúrate de que el módulo de IA esté encendido.',
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsTyping(false);
        }
    };

    // Permite enviar presionando Enter sin Shift
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleToggle = () => setOpen((v) => !v);

    // --- RENDERIZADO MODO WIDGET (Burbuja flotante) ---
    if (widget) {
      return (
        <div className="fixed bottom-6 right-6 z-50">
          {!open && (
            <button
              aria-label="Abrir chat"
              className="w-14 h-14 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-lg transition-transform active:scale-95"
              onClick={handleToggle}
            >
              <span className="material-symbols-outlined">chat</span>
            </button>
          )}

          {open && (
            <div className="w-80 md:w-96 h-[500px] max-h-[80vh] flex flex-col bg-surface border border-outline-variant rounded-2xl shadow-xl overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-3 py-2 border-b border-outline-variant bg-surface-container-low">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-xs">R</div>
                  <div>
                    <div className="text-sm font-semibold text-primary">Matt Bortdeen</div>
                    <div className="text-xs text-on-surface-variant">En línea (Local)</div>
                  </div>
                </div>
                <button className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-surface-container-low" onClick={handleToggle} aria-label="Minimizar">
                  <span className="material-symbols-outlined">minimize</span>
                </button>
              </div>

              {/* Contenedor de Mensajes */}
              <div className="flex-grow overflow-y-auto p-3 chat-scroll space-y-3 flex flex-col">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`text-sm p-3 rounded-lg max-w-[85%] ${
                      msg.sender === 'user'
                        ? 'text-on-surface-variant bg-surface-container-highest self-end'
                        : 'text-on-primary-container bg-primary-container self-start'
                    }`}
                  >
                    {msg.text}
                  </div>
                ))}
                
                {isTyping && (
                  <div className="p-2 self-start bg-primary-container rounded-lg">
                    <div className="flex items-center gap-1">
                      <span className="w-2 h-2 bg-on-primary-container rounded-full animate-bounce" />
                      <span className="w-2 h-2 bg-on-primary-container rounded-full animate-bounce [animation-delay:0.2s]" />
                      <span className="w-2 h-2 bg-on-primary-container rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Input */}
              <div className="p-3 border-t border-outline-variant bg-surface-container-low">
                <div className="flex items-end gap-2">
                  <textarea
                    ref={textareaRef}
                    className="flex-grow py-2 bg-transparent border-none resize-none font-body-md text-body-md focus:ring-0 max-h-24 placeholder:text-on-surface-variant"
                    placeholder="Escribe al asistente..."
                    rows={1}
                    value={userInput}
                    onKeyDown={handleKeyDown}
                    onChange={(e) => setUserInput(e.target.value)}
                  />
                  <button
                    className="w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center transition-all active:scale-95"
                    onClick={handleSend}
                    aria-label="Enviar"
                  >
                    <span className="material-symbols-outlined">send</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }

    // --- RENDERIZADO MODO PANTALLA COMPLETA ---
    return (
        <div className="font-body-md text-on-surface bg-background flex flex-col min-h-screen">
            {/* TopAppBar */}
            <header className="sticky top-0 z-50 flex items-center justify-between w-full px-4 bg-surface border-b border-outline-variant md:px-10 h-16">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="w-10 h-10 rounded-full border border-outline-variant bg-primary-container text-on-primary-container flex items-center justify-center font-bold">
                          R
                        </div>
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-secondary rounded-full border-2 border-surface" title="En línea"></span>
                    </div>
                    <div>
                        <h1 className="font-headline-md text-headline-md font-semibold text-primary">Asistente Rayen</h1>
                        <p className="flex items-center gap-1 font-caption text-caption text-secondary">
                            En línea (Ecosistema Local)
                        </p>
                    </div>
                </div>
                <button className="flex items-center justify-center w-10 h-10 transition-colors duration-200 rounded-full hover:bg-surface-container-low active:scale-95">
                    <span className="material-symbols-outlined text-on-surface-variant">more_vert</span>
                </button>
            </header>

            {/* Main Chat Canvas */}
            <main className="flex-grow flex flex-col w-full max-w-6xl mx-auto px-4 md:px-10 py-6 overflow-hidden">
                <div className="flex-grow overflow-y-auto chat-scroll space-y-6 pr-2">
                    <div className="flex justify-center my-4">
                        <span className="px-3 py-1 font-caption text-caption text-on-surface-variant bg-surface-container-low rounded-full">Hoy</span>
                    </div>

                    {/* Mapeo dinámico del historial de mensajes */}
                    {messages.map((msg) => (
                        <div 
                          key={msg.id} 
                          className={`flex flex-col max-w-[85%] md:max-w-[70%] animate-in fade-in duration-300 ${
                            msg.sender === 'user' ? 'items-end ml-auto slide-in-from-right-4' : 'items-start slide-in-from-left-4'
                          }`}
                        >
                            <div className={`p-4 border rounded-t-xl ${
                              msg.sender === 'user' 
                                ? 'bg-surface-container-highest text-on-surface-variant border-outline-variant rounded-bl-xl' 
                                : 'text-on-primary-container bg-primary-container rounded-br-xl medical-glow border-transparent'
                            }`}>
                                <p className="font-body-md text-body-md whitespace-pre-wrap">{msg.text}</p>
                            </div>
                            <span className={`mt-1 font-caption text-caption text-on-surface-variant ${msg.sender === 'user' ? 'mr-1' : 'ml-1'}`}>
                              {msg.time}
                            </span>
                        </div>
                    ))}

                    {/* Burbujas de escritura */}
                    {isTyping && (
                        <div className="flex flex-col items-start max-w-[85%] md:max-w-[70%]">
                            <div className="flex items-center gap-1 p-4 text-on-primary-container bg-primary-container rounded-t-xl rounded-br-xl medical-glow">
                                <span className="w-1.5 h-1.5 bg-on-primary-container rounded-full animate-bounce"></span>
                                <span className="w-1.5 h-1.5 bg-on-primary-container rounded-full animate-bounce [animation-delay:0.2s]"></span>
                                <span className="w-1.5 h-1.5 bg-on-primary-container rounded-full animate-bounce [animation-delay:0.4s]"></span>
                            </div>
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </div>
            </main>

            {/* Chat Input Area */}
            <div className="px-4 pt-4 pb-24 bg-surface-container-lowest md:pb-8 md:px-10">
                <div className="flex items-end max-w-3xl gap-3 p-2 mx-auto border rounded-2xl bg-surface border-outline-variant medical-glow">
                    <button className="flex items-center justify-center w-10 h-10 transition-all rounded-full text-on-surface-variant hover:bg-surface-container-low">
                        <span className="material-symbols-outlined">add</span>
                    </button>
                    <textarea
                        ref={textareaRef}
                        className="flex-grow py-2 bg-transparent border-none resize-none font-body-md text-body-md focus:ring-0 max-h-32 placeholder:text-on-surface-variant"
                        placeholder="Haz una consulta sobre el sistema clínico..."
                        rows={1}
                        value={userInput}
                        onKeyDown={handleKeyDown}
                        onChange={(e) => setUserInput(e.target.value)}
                    />
                    <div className="flex items-center gap-1">
                        <button className="flex items-center justify-center w-10 h-10 transition-all rounded-full text-primary hover:bg-surface-container-low">
                            <span className="material-symbols-outlined">mic</span>
                        </button>
                        <button
                            className="flex items-center justify-center w-10 h-10 text-on-primary transition-all rounded-xl bg-primary medical-glow hover:bg-primary-container active:scale-95 disabled:opacity-50"
                            onClick={handleSend}
                            disabled={isTyping}
                        >
                            <span className="material-symbols-outlined">send</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Chat;
