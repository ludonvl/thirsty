<?php

namespace App\Services;

use SimpleSoftwareIO\QrCode\Facades\QrCode;

class QrcodeGenerate
{
    private $menuId;

    private $size;

    public const SIZE_SMALL = 50;

    public function __construct()
    {
        $this->size = 200;
    }

    public function setMenuId(int $id): self
    {
        $this->menuId = $id;
        return $this;
    }

    public function setSize(int $size): self
    {
        $this->size = $size;
        return $this;
    }

    public function generate()
    {
        $url = env('MENU_URL') . '/menus/' . $this->menuId;
        return QrCode::size($this->size)->generate($url);
    }
}
