import { ActionIcon, Menu, NavLink, Stack } from '@mantine/core';
import Link from 'next/link';
import classes from './index.module.css';
import type { SidebarRouteItem } from './routes';

export function SidebarItem({
    item,
    pathname,
    isCompact,
}: {
    item: SidebarRouteItem;
    pathname: string;
    isCompact: boolean;
}) {
    const Icon = item.icon;
    const hasChildren = Boolean(item.children?.length);
    const isChildActive = Boolean(item.children?.some((child) => pathname.startsWith(child.link)));
    const isActive = item.link ? pathname.startsWith(item.link) : isChildActive;

    if (isCompact) {
        if (!hasChildren) {
            return (
                <ActionIcon
                    component={Link}
                    href={item.link ?? '#'}
                    size={42}
                    data-active={isActive || undefined}
                    className={classes.miniIconBtn}
                >
                    <Icon size={20} stroke={1.5} />
                </ActionIcon>
            );
        }

        return (
            <Menu position="right-start" offset={20}>
                <Menu.Target>
                    <ActionIcon size={42} data-active={isActive || undefined} className={classes.miniIconBtn}>
                        <Icon size={20} stroke={1.5} />
                    </ActionIcon>
                </Menu.Target>
                <Menu.Dropdown className={classes.compactDropdown}>
                    <Menu.Label c="neutral.4">{item.label}</Menu.Label>
                    {item.children?.map((child) => {
                        const isSubActive = pathname.startsWith(child.link);

                        return (
                            <Menu.Item
                                key={child.link}
                                component={Link}
                                href={child.link}
                                data-active={isSubActive || undefined}
                                className={classes.compactMenuItem}
                            >
                                {child.label}
                            </Menu.Item>
                        );
                    })}
                </Menu.Dropdown>
            </Menu>
        );
    }

    if (hasChildren) {
        return (
            <NavLink
                label={item.label}
                leftSection={<Icon size={20} stroke={1.5} />}
                defaultOpened={isChildActive}
                className={classes.navLink}
            >
                <Stack gap={3}>
                    {item.children?.map((child) => (
                        <NavLink
                            key={child.link}
                            component={Link}
                            href={child.link}
                            label={child.label}
                            active={pathname.startsWith(child.link)}
                            className={classes.navLink}
                            styles={{
                                label: { fontSize: '12px' },
                            }}
                        />
                    ))}
                </Stack>
            </NavLink>
        );
    }

    return (
        <NavLink
            component={Link}
            href={item.link ?? '#'}
            label={item.label}
            leftSection={<Icon size={20} stroke={1.5} />}
            active={isActive}
            className={classes.navLink}
        />
    );
}
