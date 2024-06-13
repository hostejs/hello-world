setfont ter-p28b

# Connect to WLAN (if not LAN)
iwctl --passphrase [password] station wlan0 connect [network]

# Check partitions
lsblk

# Set partitions
# gdisk or fdisk /dev/sda
# Partition 1: +512M ef00 (for EFI)
# Partition 2: Available space 8300 (for Linux filesystem)
# (Optional Partition 3 for Virtual Machines)
# Write w, Confirm Y

# ------------------------------------------------------
# Sync time
# ------------------------------------------------------
timedatectl set-ntp true

# Sync package
pacman -Syy

# Install git, if necessary
# pacman -S git

# Clone Installation, if running ml4w.com script(s)
# git clone https://gitlab.com/stephan-raabe/archinstall.git
# cd archinstall

# Start the script, if you do that
# ./1-install.sh

# ------------------------------------------------------
# Format/re-format partitions, if necessary
# ------------------------------------------------------
# mkfs.fat -F 32 /dev/sda1;
# mkfs.btrfs -f /dev/sda2

# ------------------------------------------------------
# Mount points for btrfs
# ------------------------------------------------------
# mount /dev/sda2 /mnt
# btrfs su cr /mnt/@
# btrfs su cr /mnt/@cache
# btrfs su cr /mnt/@home
# btrfs su cr /mnt/@snapshots
# btrfs su cr /mnt/@log
# umount /mnt

# mount -o compress=zstd:1,noatime,subvol=@ /dev/sda2 /mnt
# mkdir -p /mnt/{boot/efi,home,.snapshots,var/{cache,log}}
# mount -o compress=zstd:1,noatime,subvol=@cache /dev/sda2 /mnt/var/cache
# mount -o compress=zstd:1,noatime,subvol=@home /dev/sda2 /mnt/home
# mount -o compress=zstd:1,noatime,subvol=@log /dev/sda2 /mnt/var/log
# mount -o compress=zstd:1,noatime,subvol=@snapshots /dev/sda2 /mnt/.snapshots
# mount /dev/sda1 /mnt/boot/efi

mount /dev/sda2 /mnt
mount /dev/sda1 /mnt/boot

# ------------------------------------------------------
# Mirrors - updated with reflector by default
# ------------------------------------------------------
cd /etc/pacman.d
# nano /etc/pacman.d/mirrorlist
# I liked using pacman-contrib package & rankmirrors prog, run the following:
curl -s "https://archlinux.org/mirrorlist/?country=US&protocol=https&use_mirror_status=on" | sed -e 's/^#Server/Server/' -e '/^#/d' | rankmirrors -n 6 - > mirrorlist
# maybe keep at least 1 from reflector list as a fallback as a default option

# ------------------------------------------------------
# Install base packages
# ------------------------------------------------------
# pacstrap -K /mnt base base-devel git linux linux-firmware vim openssh reflector rsync amd-ucode
pacstrap -K /mnt base linux linux-firmware nano

# ------------------------------------------------------
# Generate fstab
# ------------------------------------------------------
genfstab -U /mnt >> /mnt/etc/fstab
cat /mnt/etc/fstab

# ------------------------------------------------------
# Install configuration scripts
# ------------------------------------------------------
# mkdir /mnt/archinstall
# cp 2-configuration.sh /mnt/archinstall/
# cp 3-yay.sh /mnt/archinstall/
# cp 4-zram.sh /mnt/archinstall/
# cp 5-timeshift.sh /mnt/archinstall/
# cp 6-preload.sh /mnt/archinstall/
# cp snapshot.sh /mnt/archinstall/

# ------------------------------------------------------
# Chroot to installed sytem
# ------------------------------------------------------
# arch-chroot /mnt ./archinstall/2-configuration.sh
arch-chroot /mnt

# ------------------------------------------------------
# Set System Time
# ------------------------------------------------------
ln -sf /usr/share/zoneinfo/$zoneinfo /etc/localtime
hwclock --systohc

# ------------------------------------------------------
# Synchronize mirrors
# ------------------------------------------------------
pacman -Syy

# ------------------------------------------------------
# Install Packages
# ------------------------------------------------------
# pacman --noconfirm -S grub xdg-desktop-portal-wlr efibootmgr networkmanager network-manager-applet dialog wpa_supplicant mtools dosfstools base-devel linux-headers avahi xdg-user-dirs xdg-utils gvfs gvfs-smb nfs-utils inetutils dnsutils bluez bluez-utils cups hplip alsa-utils pipewire pipewire-alsa pipewire-pulse pipewire-jack bash-completion openssh rsync reflector acpi acpi_call dnsmasq openbsd-netcat ipset firewalld flatpak sof-firmware nss-mdns acpid os-prober ntfs-3g terminus-font exa bat htop ranger zip unzip neofetch duf xorg xorg-xinit xclip grub-btrfs xf86-video-amdgpu xf86-video-nouveau xf86-video-intel xf86-video-qxl brightnessctl pacman-contrib inxi
pacman --noconfirm -S grub xdg-desktop-portal-wlr efibootmgr networkmanager network-manager-applet dialog wpa_supplicant mtools dosfstools base-devel linux-headers avahi xdg-user-dirs xdg-utils gvfs gvfs-smb nfs-utils inetutils dnsutils bluez bluez-utils cups hplip alsa-utils pipewire pipewire-alsa pipewire-pulse pipewire-jack bash-completion openssh rsync reflector acpi acpi_call dnsmasq openbsd-netcat ipset firewalld flatpak sof-firmware nss-mdns acpid os-prober ntfs-3g terminus-font exa bat htop ranger zip unzip neofetch duf xorg xorg-xinit xclip grub-btrfs xf86-video-amdgpu xf86-video-nouveau xf86-video-intel xf86-video-qxl brightnessctl pacman-contrib inxi

# ------------------------------------------------------
# set lang utf8 US
# ------------------------------------------------------
echo "en_US.UTF-8 UTF-8" >> /etc/locale.gen
locale-gen
echo "LANG=en_US.UTF-8" >> /etc/locale.conf

# ------------------------------------------------------
# Set Keyboard
# ------------------------------------------------------
echo "FONT=ter-v18n" >> /etc/vconsole.conf
echo "KEYMAP=$keyboardlayout" >> /etc/vconsole.conf

# ------------------------------------------------------
# Set hostname and localhost
# ------------------------------------------------------
echo "$hostname" >> /etc/hostname
echo "127.0.0.1 localhost" >> /etc/hosts
echo "::1       localhost" >> /etc/hosts
echo "127.0.1.1 $hostname.localdomain $hostname" >> /etc/hosts
clear

# ------------------------------------------------------
# Set Root Password
# ------------------------------------------------------
echo "Set root password"
passwd root

# ------------------------------------------------------
# Add User
# ------------------------------------------------------
echo "Add user $username"
useradd -m -G wheel $username
passwd $username

# ------------------------------------------------------
# Enable Services
# ------------------------------------------------------
systemctl enable NetworkManager
systemctl enable bluetooth
systemctl enable cups.service
systemctl enable sshd
systemctl enable avahi-daemon
systemctl enable reflector.timer
systemctl enable fstrim.timer
systemctl enable firewalld
systemctl enable acpid

# ------------------------------------------------------
# Grub installation
# ------------------------------------------------------
grub-install --target=x86_64-efi --efi-directory=/boot/efi --bootloader-id=GRUB --removable
grub-mkconfig -o /boot/grub/grub.cfg

# ------------------------------------------------------
# Add btrfs and setfont to mkinitcpio
# ------------------------------------------------------
# Creating a new initramfs is usually not required, because mkinitcpio was run on installation of the kernel package with pacstrap.
# Before: BINARIES=()
# After:  BINARIES=(btrfs setfont)
# sed -i 's/BINARIES=()/BINARIES=(btrfs setfont)/g' /etc/mkinitcpio.conf
# mkinitcpio -p linux

# ------------------------------------------------------
# Add user to wheel
# ------------------------------------------------------
clear
echo "Uncomment %wheel group in sudoers (around line 85):"
echo "Before: #%wheel ALL=(ALL:ALL) ALL"
echo "After:  %wheel ALL=(ALL:ALL) ALL"
echo ""
read -p "Open sudoers now?" c
EDITOR=vim sudo -E visudo
usermod -aG wheel $username

# ------------------------------------------------------
# Copy installation scripts to home directory 
# ------------------------------------------------------
# cp /archinstall/3-yay.sh /home/$username
# cp /archinstall/4-zram.sh /home/$username
# cp /archinstall/5-timeshift.sh /home/$username
# cp /archinstall/6-preload.sh /home/$username
# cp /archinstall/snapshot.sh /home/$username

