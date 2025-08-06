// src/pages/Playground.tsx
import { Button } from '@/components/ui-kit/Button';
import { Input } from '@/components/ui-kit/Input';
import { Card } from '@/components/ui-kit/Card';
import { Modal } from '@/components/ui-kit/Modal';
import { Panel } from '@/components/ui-kit/Panel';
import { useState } from 'react';

const Playground = () => {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="p-8 space-y-8 bg-gray-50 min-h-screen">
      <section>
        <h2 className="text-2xl font-bold mb-4">Buttons</h2>
        <div className="flex gap-4 flex-wrap">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
          <Button onClick={() => setModalOpen(true)}>Open Modal</Button>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Inputs</h2>
        <Input label="Name" placeholder="Enter your name" />
        <Input label="Email" placeholder="Enter your email" error="Required field" />
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Cards</h2>
        <Card title="Example Card">This is a basic card component using the brand style.</Card>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Containers</h2>
        <Panel title="Example Panel">Panel content goes here with padding and border-radius.</Panel>
      </section>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Modal Title">
        <p>This is the content inside the modal.</p>
        <Button variant="secondary" onClick={() => setModalOpen(false)}>Close</Button>
      </Modal>
    </div>
  );
};

export default Playground;
