setfont ter-p32b

# Connect to WLAN (if not LAN)
iwctl --passphrase [password] station wlan0 connect [network]
timedatectl set-ntp true
mount /dev/sda2 /mnt
cp /mnt/etc/pacman.d/mirrorlist /etc/pacman.d/mirrorlist-copy
umount /mnt
mkfs.fat -F 32 /dev/sda1;
mkfs.ext4 -f /dev/sda2
mount /dev/sda2 /mnt
mount /dev/sda1 /mnt/boot
pacstrap -K /mnt base linux linux-firmware nano sudo networkmanager dialog wpa_supplicant xorg-server xorg-xinit qemu-desktop ovmf
genfstab -U /mnt >> /mnt/etc/fstab
arch-chroot /mnt
ln -sf /usr/share/zoneinfo/US/Eastern /etc/localtime
hwclock --systohc
pacman -Syy

# qemu-system-x86_64 -display :0
# pacman --noconfirm -S grub xdg-desktop-portal-wlr efibootmgr networkmanager network-manager-applet dialog wpa_supplicant mtools dosfstools base-devel linux-headers avahi xdg-user-dirs xdg-utils gvfs gvfs-smb nfs-utils inetutils dnsutils bluez bluez-utils cups hplip alsa-utils pipewire pipewire-alsa pipewire-pulse pipewire-jack bash-completion openssh rsync reflector acpi acpi_call dnsmasq openbsd-netcat ipset firewalld flatpak sof-firmware nss-mdns acpid os-prober ntfs-3g terminus-font exa bat htop ranger zip unzip neofetch duf xorg xorg-xinit xclip grub-btrfs xf86-video-amdgpu xf86-video-nouveau xf86-video-intel xf86-video-qxl brightnessctl pacman-contrib inxi
# https://ratfactor.com/dwm

echo "en_US.UTF-8 UTF-8" >> /etc/locale.gen
locale-gen
echo "LANG=en_US.UTF-8" >> /etc/locale.conf
echo "FONT=ter-p32b" >> /etc/vconsole.conf
echo "$hostname" >> /etc/hostname
echo "127.0.0.1 localhost" >> /etc/hosts
echo "::1       localhost" >> /etc/hosts
# passwd root // is this needed?
useradd -m -G wheel hoste
passwd hoste
systemctl enable NetworkManager
bootctl install
# must also create files and look up the id for root device
blkid /dev/sda2
touch /boot/loader/entries/arch.conf
nano -w /boot/loader/entries/arch.conf
# write following:
# title   Arch Linux
# linux   /vmlinuz-linux
# initrd  /initramfs-linux.img
# options root=PARTUUID=<ID from blkid> rw

# also optional but might help:
# echo ' ' > /boot/loader/loader.conf
# nano -w /boot/loader/loader.conf
# default arch
# timeout 4
# console-mode max
# editor no
# bootctl update

# grub-install --target=x86_64-efi --efi-directory=/boot/efi --bootloader-id=GRUB --removable
# grub-mkconfig -o /boot/grub/grub.cfg

echo "Uncomment %wheel group in sudoers (around line 85):"
echo "Before: #%wheel ALL=(ALL:ALL) ALL"
echo "After:  %wheel ALL=(ALL:ALL) ALL"
usermod -aG wheel hoste

# run nmtui after login to set/enable wifi

# things to check
# keep setup for distrobox and qemu/virt-manager in back of mind
# for battery checking you can use the acpi or upower commands or set watch: watch to run -n0 cat /sys/class/power_supply/BAT0/capacity

while xsetroot -name "$(acpi -b | awk 'NR != 2 {print $4}') | $(free -h | awk '/^Mem/ {print $3}') | $(df -h / | awk '/^\/dev/ {print $3}') | $(uptime | sed 's/.*,//') | $(date '+%m/%d/%Y %H:%M')"
do
  	sleep 1
done &
exec dwm
