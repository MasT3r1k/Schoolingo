import { NgModule } from '@angular/core';

import { TablerIconsModule } from 'angular-tabler-icons';
// import { IconMenu2, IconBrandDiscord, IconSettings, IconUsers } from 'angular-tabler-icons/icons';
import { IconAlertTriangle, IconArrowBigRight, IconBaselineDensityMedium, IconBox, IconBrandDiscord, IconBriefcase2, IconBuilding, IconCalendarMonth, IconCalendarWeek, IconCaretLeft, IconCaretLeftFilled, IconChalkboard, IconCheck, IconChevronLeft, IconChevronRight, IconClick, IconClockHour4, IconCornerUpLeft, IconDeviceDesktop, IconDeviceMobile, IconDotsVertical, IconEdit, IconExclamationMark, IconFileReport, IconFilter, IconFlag3Filled, IconGenderFemale, IconGenderMale, IconHomeCancel, IconInfinity, IconInfoCircle, IconLetterD, IconLetterN, IconLetterO, IconLetterP, IconLogout, IconMail, IconMeat, IconMenu2, IconMessages, IconMinus, IconNotes, IconOld, IconPaperclip, IconPencil, IconPhone, IconPlus, IconQuestionMark, IconSchool, IconSettings, IconShield, IconSlash, IconSquareForbid, IconTable, IconTags, IconThumbUp, IconTimeDuration5, IconTrashX, IconTrashXFilled, IconTrophy, IconUsers, IconUserScreen, IconUserX, IconWindowMaximize, IconWindowMinimize, IconX } from 'angular-tabler-icons/icons';

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
  IconTrashX,
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
  IconInfoCircle,
  IconQuestionMark,
  IconGenderMale,
  IconGenderFemale,
  IconPlus,
  IconPencil,
  IconClockHour4,
  IconPhone,
  IconCaretLeftFilled,
  IconBox,
  IconFlag3Filled,
  IconTrophy,
  IconHomeCancel,
  IconClick
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