import Button from '@/components/Button';

interface Props {
  currentPage: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
}

export default function Pagination({ currentPage, totalPages, onPrev, onNext }: Props) {
  return (
    <section className="flex items-center justify-end gap-4">
      <Button
        size="sm"
        variant="outline"
        className="font-medium"
        disabled={currentPage === 1}
        onClick={onPrev}
      >
        ← Anterior
      </Button>
      <span className="text-sm text-gray-500">
        Página {currentPage} de {totalPages}
      </span>
      <Button
        size="sm"
        variant="outline"
        className="font-medium"
        disabled={currentPage === totalPages}
        onClick={onNext}
      >
        Siguiente →
      </Button>
    </section>
  );
}
