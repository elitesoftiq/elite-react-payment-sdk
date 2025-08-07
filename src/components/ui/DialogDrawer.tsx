import * as React from 'react';

import { useMediaQuery } from '@/hooks/useMediaQuery';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';
import { useTranslation } from 'react-i18next';

export function DrawerDialogDemo({
    title,
    trigger,
    children,
    open,
    setOpen,
    maxHeight = true,
    applyFilters,
    widthClassName = 'w-[400px] max-w-[600px]',
}: {
    title?: string;
    trigger: React.ReactNode;
    children: React.ReactNode;
    open: boolean;
    setOpen: (open: boolean) => void;
    maxHeight?: boolean;
    widthClassName?: string;
    applyFilters?: () => void;
}) {
    const { i18n } = useTranslation();
    const isDesktop = useMediaQuery('(min-width: 768px)');

    function handleApplyFilters(isOpen: boolean) {
        if (!isOpen && applyFilters) {
            applyFilters();
        }
        setOpen(isOpen);
    }

    if (isDesktop) {
        return (
            <Dialog open={open} onOpenChange={handleApplyFilters}>
                <DialogTrigger asChild>{trigger}</DialogTrigger>
                <DialogContent
                    dir={i18n.dir()}
                    aria-describedby={''}
                    className={`${widthClassName} ${maxHeight ? 'max-h-[80%] px-0' : ''}`}
                >
                    <DialogHeader className="flex " dir={i18n.dir()}>
                        <DialogTitle
                            className={`text-2xl text-new-primary px-4
                                font-semibold
                                ${i18n.dir() == 'rtl' ? 'text-right' : ''}`}
                        >
                            {title}
                        </DialogTitle>
                    </DialogHeader>
                    {children}
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Drawer open={open} onOpenChange={handleApplyFilters}>
            <DrawerTrigger asChild>{trigger}</DrawerTrigger>
            <DrawerContent className="p-4 w-[100vw] max-h-[80vh] px-0">{children}</DrawerContent>
        </Drawer>
    );
}
