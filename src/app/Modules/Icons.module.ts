import { NgModule } from '@angular/core';

import { TablerIconsModule } from 'angular-tabler-icons';
// import { IconMenu2, IconBrandDiscord, IconSettings, IconUsers } from 'angular-tabler-icons/icons';
import { IconAlertTriangle, IconArrowBigRight, IconBaselineDensityMedium, IconBrandDiscord, IconBriefcase2, IconBuilding, IconCalendarMonth, IconCalendarWeek, IconChalkboard, IconCheck, IconChevronLeft, IconChevronRight, IconCornerUpLeft, IconDeviceDesktop, IconDeviceMobile, IconDotsVertical, IconEdit, IconExclamationMark, IconFileReport, IconFilter, IconInfinity, IconInfoCircle, IconLetterD, IconLetterN, IconLetterO, IconLetterP, IconLogout, IconMail, IconMeat, IconMenu2, IconMessages, IconMinus, IconNotes, IconOld, IconPaperclip, IconSchool, IconSettings, IconShield, IconSlash, IconSquareForbid, IconTable, IconTags, IconThumbUp, IconTimeDuration5, IconTrashXFilled, IconUsers, IconUserScreen, IconUserX, IconWindowMaximize, IconWindowMinimize, IconX } from 'angular-tabler-icons/icons';

// Select some icons (use an object, not an array)
const icons = {
  IconMenu2,
  IconBrandDiscord,
  IconSettings,
  IconUsers,
  IconChalkboard,
  IconLogout,
  IconTimeDuration5,
  IconNotes,
  IconTable,
  IconMeat,
  IconInfinity,
  IconWindowMinimize,
  IconWindowMaximize,
  IconDotsVertical,
  IconCalendarMonth,
  IconExclamationMark,
  IconChevronLeft,
  IconChevronRight,
  IconCheck,
  IconX,
  IconUserX,
  IconTags,
  IconPaperclip,
  IconOld,
  IconUserScreen,
  IconFilter,
  IconMessages,
  IconMail,
  IconCornerUpLeft,
  IconArrowBigRight,
  IconSquareForbid,
  IconBriefcase2,
  IconFileReport,
  IconThumbUp,
  IconShield,
  IconSchool,
  IconBuilding,
  IconCalendarWeek,
  IconEdit,
  IconTrashXFilled,
  IconDeviceMobile,
  IconDeviceDesktop,
  IconBaselineDensityMedium,
  IconSlash,
  IconMinus,
  IconLetterN,
  IconLetterP,
  IconLetterO,
  IconLetterD,
  IconAlertTriangle,
  IconInfoCircle
};

@NgModule({
  imports: [
    TablerIconsModule.pick(icons)
  ],
  exports: [
    TablerIconsModule
  ]
})

export class IconsModule {}